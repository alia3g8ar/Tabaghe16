import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const rawFrontendUrl =
        process.env.FRONTEND_URL || 'http://localhost:3000';

    const frontendUrl = rawFrontendUrl
        .replace(/[\u0000-\u001F\u007F]/g, '')
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

    app.enableCors({
        origin: allowedOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
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
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
