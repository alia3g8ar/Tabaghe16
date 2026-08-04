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
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcrypt';
import { LoginUserDto } from '../dto/login-user.dto';
import { RefreshtokenDto } from '../dto/refresh-token.dto';
import { PayloadAccess, PayloadRefresh } from 'src/common/@type/payload.type';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
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

    async checkEmail(email: string) {
        const existsUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existsUser) throw new ConflictException('email already exists');
    }

    async createUser(email: string) {
        const user = this.userRepository.create({
            email,
            is_verified: true,
        });

        return this.userRepository.save(user);
    }

    async loginWithOtp(email: string) {
        let user = await this.userRepository.findOneBy({
            email,
        });

        if (!user) {
            user = this.userRepository.create({
                email,
                is_verified: true,
            });

            user = await this.userRepository.save(user);
        } else if (!user.is_verified) {
            user.is_verified = true;
            user = await this.userRepository.save(user);
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

        const accessToken = this.jwtService.sign(payloadAccess, {
            expiresIn: '10m',
        });
        const refreshToken = this.jwtService.sign(payloadRefresh, {
            expiresIn: '25d',
        });

        return { accessToken, refreshToken };
    }
}
