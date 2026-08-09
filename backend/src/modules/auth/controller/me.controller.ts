import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Req,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { memoryStorage } from 'multer';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AuthService } from '../services/auth.service';
import { AVATAR_MIME_EXTENSIONS } from '../services/avatar-storage.service';

type AuthRequest = Request & {
    user: {
        sub: number | string;
        role: string;
    };
};

const MAX_AVATAR_SIZE = 4 * 1024 * 1024; // 4MB — under Vercel's ~4.5MB server upload limit

@Controller('me')
export class MeController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    getProfile(@Req() request: AuthRequest) {
        return this.authService.getProfile(request.user.sub);
    }

    @Patch()
    updateProfile(@Body() dto: UpdateProfileDto, @Req() request: AuthRequest) {
        return this.authService.updateProfile(request.user.sub, dto);
    }

    @Post('avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            // Keep the file in memory: the bytes are forwarded to Vercel Blob
            // instead of being persisted to the ephemeral local filesystem.
            storage: memoryStorage(),
            fileFilter: (_req, file, cb) => {
                if (!AVATAR_MIME_EXTENSIONS[file.mimetype]) {
                    cb(
                        new BadRequestException(
                            'فقط فایل‌های تصویری (jpg, png, webp, gif) مجاز هستند',
                        ),
                        false,
                    );
                    return;
                }
                cb(null, true);
            },
            limits: { fileSize: MAX_AVATAR_SIZE },
        }),
    )
    uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Req() request: AuthRequest,
    ) {
        if (!file) {
            throw new BadRequestException('فایل آواتار ارسال نشده است');
        }
        return this.authService.updateAvatar(request.user.sub, {
            buffer: file.buffer,
            contentType: file.mimetype,
        });
    }
}
