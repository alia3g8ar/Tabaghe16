import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository } from 'typeorm';

import { EmailService } from 'src/common/services/email.service';
import { Otp } from '../entities/otp.entity';
import { AuthService } from './auth.service';
import { OtpCodeDto } from '../dto/otp-code.dto';
import { SendEmailDto } from '../dto/send-email.dto';

const DEFAULT_OTP_TTL_SECONDS = 120;
const DEFAULT_OTP_COOLDOWN_SECONDS = 60;
const DEFAULT_OTP_MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
    private readonly ttlSeconds: number;
    private readonly cooldownSeconds: number;
    private readonly maxAttempts: number;

    constructor(
        private readonly emailService: EmailService,
        @InjectRepository(Otp)
        private readonly otpRepository: Repository<Otp>,
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.ttlSeconds = this.readPositiveInt(
            'OTP_TTL_SECONDS',
            DEFAULT_OTP_TTL_SECONDS,
        );
        this.cooldownSeconds = this.readPositiveInt(
            'OTP_COOLDOWN_SECONDS',
            DEFAULT_OTP_COOLDOWN_SECONDS,
        );
        this.maxAttempts = this.readPositiveInt(
            'OTP_MAX_ATTEMPTS',
            DEFAULT_OTP_MAX_ATTEMPTS,
        );
    }

    async sendEmail(dto: SendEmailDto) {
        const email = this.normalizeEmail(dto.email);

        const existing = await this.otpRepository.findOneBy({ email });

        if (existing) {
            const cooldownUntil = new Date(
                existing.lastSentAt.getTime() + this.cooldownSeconds * 1000,
            );

            if (cooldownUntil > new Date()) {
                throw new HttpException(
                    'کد تایید قبلا ارسال شده است. لطفا کمی بعد تلاش کنید.',
                    HttpStatus.TOO_MANY_REQUESTS,
                );
            }
        }

        const otp = await this.emailService.sendOtp(email);

        const codeHash = await hash(otp, 10);

        const now = new Date();

        const expiresAt = new Date(now.getTime() + this.ttlSeconds * 1000);

        // One active row per normalized email: the upsert replaces any previous
        // OTP for the same email, so only the most recently sent code remains
        // valid. A narrow simultaneous-send race may send two emails, but the
        // last persisted OTP always wins.
        await this.otpRepository
            .createQueryBuilder()
            .insert()
            .into(Otp)
            .values({
                email,
                codeHash,
                expiresAt,
                attempts: 0,
                lastSentAt: now,
            })
            .orUpdate(
                ['codeHash', 'expiresAt', 'attempts', 'lastSentAt'],
                ['email'],
            )
            .execute();

        return {
            message: 'OTP sent successfully',
        };
    }

    async verifyOtp(dto: OtpCodeDto) {
        const email = this.normalizeEmail(dto.email);

        const record = await this.otpRepository.findOneBy({ email });

        if (!record) {
            throw new BadRequestException('OTP expired or not requested');
        }

        if (record.expiresAt.getTime() <= Date.now()) {
            await this.otpRepository.delete({
                id: record.id,
                codeHash: record.codeHash,
            });
            throw new BadRequestException('OTP expired or not requested');
        }

        if (record.attempts >= this.maxAttempts) {
            await this.otpRepository.delete({
                id: record.id,
                codeHash: record.codeHash,
            });
            throw new BadRequestException('OTP expired or not requested');
        }

        const isValid = await compare(dto.code, record.codeHash);

        if (!isValid) {
            const updateResult = await this.otpRepository
                .createQueryBuilder()
                .update(Otp)
                .set({ attempts: () => 'attempts + 1' })
                .where('id = :id AND codeHash = :codeHash', {
                    id: record.id,
                    codeHash: record.codeHash,
                })
                .execute();

            if (updateResult.affected === 0) {
                throw new BadRequestException('OTP expired or not requested');
            }

            // The send upsert keeps the same row id and resets attempts to 0, so
            // this re-read can only observe the record that was just incremented;
            // a replaced OTP would have attempts reset and is never invalidated
            // here by an older verification request.
            const refreshed = await this.otpRepository.findOneBy({
                id: record.id,
            });

            if (refreshed && refreshed.attempts >= this.maxAttempts) {
                await this.otpRepository.delete({
                    id: refreshed.id,
                    codeHash: refreshed.codeHash,
                });
            }

            throw new UnauthorizedException('Invalid OTP code');
        }

        const consumed = await this.otpRepository.delete({
            id: record.id,
            codeHash: record.codeHash,
        });

        if (consumed.affected !== 1) {
            throw new BadRequestException('OTP expired or not requested');
        }

        const authResult = await this.authService.loginWithOtp(email);

        return {
            message: 'Login successful',
            data: authResult,
        };
    }

    private normalizeEmail(email: string): string {
        return email.trim().toLowerCase();
    }

    private readPositiveInt(name: string, fallback: number): number {
        const raw = this.configService.get<string>(name);

        if (raw === undefined) {
            return fallback;
        }

        const parsed = Number(raw);

        if (!Number.isInteger(parsed) || parsed <= 0) {
            return fallback;
        }

        return parsed;
    }
}
