import {
    BadGatewayException,
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { LoginUserDto } from '../dto/login-user.dto';
import { RefreshtokenDto } from '../dto/refresh-token.dto';
import { PayloadAccess, PayloadRefresh } from 'src/common/@type/payload.type';
import { AvatarStorageService } from './avatar-storage.service';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
        private readonly avatarStorageService: AvatarStorageService,
    ) {}

    async activateAccount(dto: CreateUserDto, id: number) {
        const { name, password } = dto;

        const user = await this.userRepository.findOneBy({ id });
        if (!user) throw new NotFoundException('user not found');
        if (!user.is_verified)
            throw new BadRequestException('email not verify');

        await this.userRepository.update(id, {
            name,
            password,
        });

        const newUser = await this.userRepository.findOneBy({ id });
        if (!newUser) throw new BadGatewayException('user cant login');

        const { accessToken, refreshToken } = this.generateTokens(newUser);
        newUser.refreshToken = await hash(refreshToken, 10);
        await this.userRepository.save(newUser);

        return {
            message: 'user actived successfully',
            data: { accessToken, refreshToken },
        };
    }

    async login(dto: LoginUserDto) {
        const { email, password } = dto;

        const user = await this.userRepository.findOneBy({ email });
        if (!user) throw new NotFoundException('user not found!');
        if (!user.is_verified)
            throw new UnauthorizedException('user not active');

        const isPasswordValidation = await compare(password, user.password);
        if (!isPasswordValidation)
            throw new UnauthorizedException('password is not true');

        const { accessToken, refreshToken } = this.generateTokens(user);

        const hashedToken: string = await hash(refreshToken, 10);
        await this.userRepository.update(user.id, {
            refreshToken: hashedToken,
        });

        return {
            message: 'login successfully',
            data: { accessToken, refreshToken },
        };
    }

    async refreshToken(dto: RefreshtokenDto) {
        const { refresh_token } = dto;
        try {
            const payLoad =
                await this.jwtService.verifyAsync<PayloadRefresh>(
                    refresh_token,
                );

            const user = await this.userRepository.findOneBy({
                id: payLoad.sub,
            });
            if (!user) throw new NotFoundException('user not found');

            if (!user.refreshToken)
                throw new UnauthorizedException('tocken not true');
            const isToken = await compare(refresh_token, user.refreshToken);
            if (!isToken) throw new UnauthorizedException('tocken not true');

            const { accessToken } = this.generateTokens(user);

            return { message: 'tocken changed', data: { accessToken } };
        } catch {
            throw new UnauthorizedException('tocken not true');
        }
    }

    async getProfile(id: number | string) {
        const user = await this.userRepository.findOneBy({
            id: Number(id),
        });

        if (!user) {
            throw new NotFoundException('user not found');
        }

        return {
            message: 'profile fetched successfully',
            data: this.toSafeProfile(user),
        };
    }

    async updateProfile(id: number | string, dto: UpdateProfileDto) {
        const user = await this.userRepository.findOneBy({
            id: Number(id),
        });

        if (!user) {
            throw new NotFoundException('user not found');
        }

        if (dto.name !== undefined) {
            user.name = dto.name;
        }

        if (dto.phone !== undefined) {
            user.phone = dto.phone;
        }

        const updated = await this.userRepository.save(user);

        return {
            message: 'profile updated successfully',
            data: this.toSafeProfile(updated),
        };
    }

    async updateAvatar(
        id: number | string,
        file: { buffer: Buffer; contentType: string },
    ) {
        const user = await this.userRepository.findOneBy({
            id: Number(id),
        });

        if (!user) {
            throw new NotFoundException('user not found');
        }

        // Upload the new image first: if the Blob upload fails, the database
        // stays untouched and the previous avatar remains intact.
        const newAvatarUrl = await this.avatarStorageService.uploadAvatar(
            user.id,
            file.buffer,
            file.contentType,
        );

        const previousAvatarUrl = user.avatarUrl;

        user.avatarUrl = newAvatarUrl;
        const updated = await this.userRepository.save(user);

        // Best-effort cleanup of the previous avatar Blob object (only URLs
        // that belong to our own Vercel Blob store). A cleanup failure never
        // breaks the request or the newly uploaded avatar.
        await this.avatarStorageService.deleteIfOwned(previousAvatarUrl);

        return {
            message: 'avatar updated successfully',
            data: this.toSafeProfile(updated),
        };
    }

    private normalizeName(name: string | undefined): string | null {
        if (name === undefined || name === null) return null;

        const trimmed = name.trim();

        if (trimmed.length === 0) return null;

        return trimmed.slice(0, 255);
    }

    private isDuplicateKeyError(error: unknown): boolean {
        if (typeof error !== 'object' || error === null) {
            return false;
        }

        const candidate = error as {
            code?: string;
            errno?: number;
            driverError?: { code?: string; errno?: number };
        };

        return (
            candidate.code === 'ER_DUP_ENTRY' ||
            candidate.errno === 1062 ||
            candidate.driverError?.code === 'ER_DUP_ENTRY' ||
            candidate.driverError?.errno === 1062
        );
    }

    private toSafeProfile(user: User) {
        return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,
            createdAt: user.createdAt,
        };
    }

    async checkEmail(email: string) {
        const existsUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existsUser) throw new ConflictException('email already exists');
    }

    // A fresh account, or an existing account that never got a name, still
    // needs the name at sign-in; returning users who already set one just
    // enter their email.
    async needsName(email: string): Promise<boolean> {
        const normalized = email.trim().toLowerCase();

        const user = await this.userRepository.findOneBy({
            email: normalized,
        });

        if (!user) return true;

        return !user.name?.trim();
    }

    async createUser(email: string) {
        const user = this.userRepository.create({
            email,
            is_verified: true,
        });

        return this.userRepository.save(user);
    }

    async loginWithOtp(email: string, name?: string) {
        const normalizedName = this.normalizeName(name);

        let user = await this.userRepository.findOneBy({
            email,
        });

        if (!user) {
            try {
                user = await this.userRepository.save(
                    this.userRepository.create({
                        email,
                        name: normalizedName,
                        is_verified: true,
                    }),
                );
            } catch (error) {
                // Two simultaneous logins for the same new email: the unique
                // email index rejects the second insert. Fall back to the row
                // that was persisted first so one email always maps to exactly
                // one account, whether the user is regular or admin.
                if (!this.isDuplicateKeyError(error)) {
                    throw error;
                }

                const existing = await this.userRepository.findOneBy({ email });

                if (!existing) {
                    throw error;
                }

                user = existing;
            }
        } else {
            let needsSave = false;

            if (!user.is_verified) {
                user.is_verified = true;
                needsSave = true;
            }

            if (normalizedName && !user.name) {
                user.name = normalizedName;
                needsSave = true;
            }

            if (needsSave) {
                user = await this.userRepository.save(user);
            }
        }

        const { accessToken, refreshToken } = this.generateTokens(user);

        const hashedRefreshToken = await hash(refreshToken, 10);

        await this.userRepository.update(user.id, {
            refreshToken: hashedRefreshToken,
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };
    }

    generateTokens(user: User) {
        const payloadAccess: PayloadAccess = {
            sub: user.id,
            role: user.role,
        };

        const payloadRefresh: PayloadRefresh = {
            sub: user.id,
        };

        // Sessions last 30 days: the access token itself is valid for 30 days
        // so active users are never interrupted by token refreshes, and after
        // 30 days without a visit the user simply logs in again.
        const accessToken = this.jwtService.sign(payloadAccess, {
            expiresIn: '30d',
        });
        const refreshToken = this.jwtService.sign(payloadRefresh, {
            expiresIn: '30d',
        });

        return { accessToken, refreshToken };
    }
}
