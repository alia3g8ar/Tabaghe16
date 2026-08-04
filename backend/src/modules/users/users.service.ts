import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { roleEnum } from 'src/common/enums/role.enum';
import { User } from '../auth/entities/user.entity';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserVerificationDto } from './dto/update-user-verification.dto';

type Actor = {
    sub: number | string;
    role: roleEnum;
};

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(query: ListUsersQueryDto) {
        const { page, limit, role } = query;
        const search = query.search?.trim();
        const usersQuery = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.name',
                'user.email',
                'user.role',
                'user.is_verified',
                'user.createdAt',
                'user.updatedAt',
            ])
            .orderBy('user.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (search) {
            usersQuery.andWhere(
                new Brackets((builder) => {
                    builder
                        .where('user.email LIKE :search', {
                            search: `%${search}%`,
                        })
                        .orWhere('user.name LIKE :search', {
                            search: `%${search}%`,
                        });
                }),
            );
        }

        if (role) {
            usersQuery.andWhere('user.role = :role', { role });
        }

        const [users, total] = await usersQuery.getManyAndCount();

        return {
            message: 'users fetched successfully',
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateRole(id: number, dto: UpdateUserRoleDto, actor: Actor) {
        if (this.isSameUser(actor.sub, id)) {
            throw new ForbiddenException(
                'شما نمی‌توانید نقش حساب کاربری خود را تغییر دهید',
            );
        }

        const user = await this.findUser(id);
        this.assertCanModify(user, actor);

        if (actor.role === roleEnum.ADMIN && dto.role === roleEnum.OWNER) {
            throw new ForbiddenException('admins cannot assign the owner role');
        }

        if (user.role === dto.role) {
            throw new BadRequestException('user already has this role');
        }

        user.role = dto.role;
        const updatedUser = await this.userRepository.save(user);

        return {
            message: 'user role updated successfully',
            data: this.toSafeUser(updatedUser),
        };
    }

    async updateVerification(
        id: number,
        dto: UpdateUserVerificationDto,
        actor: Actor,
    ) {
        const user = await this.findUser(id);
        this.assertCanModify(user, actor);

        if (user.is_verified === dto.is_verified) {
            throw new BadRequestException(
                'user already has this verification status',
            );
        }

        user.is_verified = dto.is_verified;
        const updatedUser = await this.userRepository.save(user);

        return {
            message: 'user verification updated successfully',
            data: this.toSafeUser(updatedUser),
        };
    }

    async remove(id: number, actor: Actor) {
        if (this.isSameUser(actor.sub, id)) {
            throw new ForbiddenException('you cannot delete your own account');
        }

        const user = await this.findUser(id);
        this.assertCanModify(user, actor);
        await this.userRepository.remove(user);

        return {
            message: 'user deleted successfully',
        };
    }

    private async findUser(id: number): Promise<User> {
        const user = await this.userRepository.findOneBy({ id });

        if (!user) {
            throw new NotFoundException('user not found');
        }

        return user;
    }

    private assertCanModify(user: User, actor: Actor): void {
        if (actor.role === roleEnum.ADMIN && user.role === roleEnum.OWNER) {
            throw new ForbiddenException('admins cannot modify an owner');
        }
    }

    private isSameUser(actorId: number | string, targetId: number): boolean {
        return Number(actorId) === Number(targetId);
    }

    private toSafeUser(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            is_verified: user.is_verified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
