import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Serve user-uploaded files (avatars, etc.) from backend/public/uploads.
    // Files live in public/uploads/avatars/... so the static root is
    // public/uploads, making them reachable at /uploads/avatars/... .
    // In production the global prefix is /api/backend, so also mount the
    // same folder under that path to survive Vercel's /api/backend/(.*)
    // rewrite.
    const uploadsRoot = join(process.cwd(), 'public', 'uploads');

    app.useStaticAssets(uploadsRoot, {
        prefix: '/uploads/',
    });

    if (process.env.NODE_ENV === 'production') {
        app.useStaticAssets(uploadsRoot, {
            prefix: '/api/backend/uploads/',
        });
    }

    const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    const frontendUrl = rawFrontendUrl
        .split('')
        .filter(
            (char) => char.charCodeAt(0) > 0x1f && char.charCodeAt(0) !== 0x7f,
        )
        .join('')
        .trim();

    let allowedOrigin: string;

    try {
        const parsedFrontendUrl = new URL(frontendUrl);

        if (!['http:', 'https:'].includes(parsedFrontendUrl.protocol)) {
            throw new Error('Unsupported protocol');
        }

        allowedOrigin = parsedFrontendUrl.origin;
    } catch {
        throw new Error(
            'FRONTEND_URL must be a valid HTTP(S) URL without extra text',
        );
    }

    if (process.env.NODE_ENV === 'production') {
        app.setGlobalPrefix('api/backend');
    }

    app.enableCors({
        origin: allowedOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
    });

    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.enableShutdownHooks();

    // On cloud platforms (e.g. Vercel/Railway) the platform injects PORT and
    // must be respected in production. Locally, the generic PORT variable may
    // be polluted by other tools (e.g. the Freebuff Desktop app on 7312), so
    // we default to 3001. An explicit BACKEND_PORT always wins.
    const port =
        process.env.BACKEND_PORT ??
        (process.env.NODE_ENV === 'production' ? process.env.PORT : 3001) ??
        3001;

    await app.listen(port);
    Logger.log(`Application is running on port ${port}`);
}
void bootstrap();
