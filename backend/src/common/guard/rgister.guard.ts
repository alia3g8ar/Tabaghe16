import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

type AuthenticatedRequest = Request & {
    user?: Record<string, unknown>;
};

@Injectable()
export class RgisterGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
        const token = this.getToken(request);

        try {
            const payload =
                await this.jwtService.verifyAsync<Record<string, unknown>>(
                    token,
                );

            request.user = payload;
        } catch {
            throw new UnauthorizedException('توکن نا معتبر میباشد');
        }

        return true;
    }

    private getToken(request: Request): string {
        const authHeader = request.headers.authorization;

        if (
            typeof authHeader !== 'string' ||
            !authHeader.startsWith('Bearer ')
        ) {
            throw new UnauthorizedException('توکن نا معتبر میباشد');
        }
        const token = authHeader.split(' ')[1];

        return token;
    }
}
