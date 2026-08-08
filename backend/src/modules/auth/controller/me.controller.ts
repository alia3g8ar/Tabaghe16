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
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AuthService } from '../services/auth.service';

type AuthRequest = Request & {
    user: {
        sub: number | string;
        role: string;
    };
};

const AVATAR_DIR = join(process.cwd(), 'public', 'uploads', 'avatars');
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MIME_EXTENSIONS: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
};

@Controller('me')
export class MeController {
    constructor(private readonly authService: AuthService) {}

    @Get()
    getProfile(@Req() request: AuthRequest) {
        return this.authService.getProfile(request.user.sub);
    }

    @Patch()
    updateProfile(
        @Body() dto: UpdateProfileDto,
        @Req() request: AuthRequest,
    ) {
        return this.authService.updateProfile(request.user.sub, dto);
    }

    @Post('avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (_req, _file, cb) => {
                    if (!existsSync(AVATAR_DIR)) {
                        mkdirSync(AVATAR_DIR, { recursive: true });
                    }
                    cb(null, AVATAR_DIR);
                },
                filename: (_req, file, cb) => {
                    const ext = MIME_EXTENSIONS[file.mimetype] || '.jpg';
                    cb(null, `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`);
                },
            }),
            fileFilter: (_req, file, cb) => {
                if (!MIME_EXTENSIONS[file.mimetype]) {
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
        return this.authService.updateAvatar(request.user.sub, file.filename);
    }
}
