import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { compare, hash } from 'bcrypt';

import { SendEmailDto } from '../dto/send-email.dto';
import { OtpCodeDto } from '../dto/otp-code.dto';
import { EmailService } from 'src/common/services/email.service';
import { CacheService } from 'src/common/services/cache.service';
import { AuthService } from './auth.service';

@Injectable()
export class OtpService {
    constructor(
        private readonly emailService: EmailService,
        private readonly cacheService: CacheService,
        private readonly authService: AuthService,
    ) {}

    async sendEmail(dto: SendEmailDto) {
        const { email } = dto;

        const otp = await this.emailService.sendOtp(email);

        const hashedCode = await hash(otp, 10);

        await this.cacheService.set(`email:${email}`, hashedCode, 120);

        return {
            message: 'OTP sent successfully',
        };
    }

    async verifyOtp(dto: OtpCodeDto) {
        const { email, code } = dto;

        const hashedCode = await this.cacheService.get(`email:${email}`);

        if (!hashedCode) {
            throw new BadRequestException('OTP expired or not requested');
        }

        const isValid = await compare(code, hashedCode);

        if (!isValid) {
            throw new UnauthorizedException('Invalid OTP code');
        }

        await this.cacheService.del(`email:${email}`);

        const authResult = await this.authService.loginWithOtp(email);

        return {
            message: 'Login successful',
            data: authResult,
        };
    }
}
