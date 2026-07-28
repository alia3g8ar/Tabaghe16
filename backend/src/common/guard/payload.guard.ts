import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PUBLIC_KEY } from '../decorators/public.decorator';

type AuthenticatedRequest = Request & {
    user?: Record<string, unknown>;
};

@Injectable()
export class PayloadGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
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
        const token = this.getToken(request);

        try {
            request.user =
                await this.jwtService.verifyAsync<Record<string, unknown>>(
                    token,
                );
        } catch {
            throw new UnauthorizedException('توکن نا معتبر میباشد');
        }

        return true;
    }

    private getToken(request: Request): string {
        const authHeader = request.headers.authorization;
        const [scheme, token, extraPart] = authHeader?.split(/\s+/) ?? [];

        if (scheme !== 'Bearer' || !token || extraPart) {
            throw new UnauthorizedException('توکن نا معتبر میباشد');
        }

        return token;
    }
}
