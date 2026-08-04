import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter<T> implements ExceptionFilter {
    catch(exception: T, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                message = res;
            } else if (res !== null && typeof res === 'object') {
                const body = res as Record<string, unknown>;
                const bodyMessage = body.message;
                if (
                    typeof bodyMessage === 'string' ||
                    Array.isArray(bodyMessage)
                ) {
                    message = bodyMessage;
                }
            }
        } else if (exception instanceof QueryFailedError) {
            status = HttpStatus.BAD_REQUEST;
            message = exception.message;
        } else if (exception instanceof Error) {
            message = exception.message;
        }
        if (status === HttpStatus.FORBIDDEN)
            message = 'شما به این بخش دسترسی ندارید';
        const errorResponse = {
            success: false,
            statusCode: status,
            message,
        };
        return response.status(status).json(errorResponse);
    }
}
