import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { roleEnum } from '../enums/role.enum';
import { PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLE_KEY } from '../decorators/role.decorator';

type AuthenticatedRequest = Request & {
    user?: {
        role?: roleEnum | string;
    };
};

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('احراز هویت انجام نشده است');
        }

        const requiredRoles =
            this.reflector.getAllAndOverride<roleEnum[]>(ROLE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

        if (!requiredRoles?.length || requiredRoles.includes(roleEnum.ALL)) {
            return true;
        }

        const hasRequiredRole =
            (user.role === roleEnum.OWNER &&
                requiredRoles.includes(roleEnum.ADMIN)) ||
            requiredRoles.includes(user.role as roleEnum);

        if (!hasRequiredRole) {
            throw new ForbiddenException('دسترسی کافی ندارید');
        }

        return true;
    }
}
