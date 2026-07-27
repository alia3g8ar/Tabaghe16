
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly transporter: nodemailer.Transporter;
    private readonly senderEmail: string;

    constructor(private readonly configService: ConfigService) {
        const email = this.configService.get<string>('EMAIL');
        const emailPassword = this.configService
    .get<string>('PASSWORD_EMAIL')
    ?.replace(/\s/g, '');
        if (!email || !emailPassword) {
            throw new Error(
                'EMAIL and PASSWORD_EMAIL environment variables are required',
            );
        }

        this.senderEmail = email;

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: emailPassword,
            },
        });
    }

    async sendOtp(email: string): Promise<string> {
        const otpCode = this.generateOtp();

        const mailOptions = {
            from: this.senderEmail,
            to: email,
            subject: 'کد تایید طبقه ۱۶',
            html: `
                <div dir="rtl" style="font-family: Arial, sans-serif;">
                    <h2>کد تایید طبقه ۱۶</h2>

                    <p>کد ورود شما:</p>

                    <h1 style="letter-spacing: 6px;">
                        ${otpCode}
                    </h1>

                    <p>
                        این کد فقط برای مدت محدودی معتبر است.
                    </p>

                    <p>
                        اگر شما درخواست ورود نداده‌اید،
                        این ایمیل را نادیده بگیرید.
                    </p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);

            return otpCode;
        } catch (error) {
            console.error('Failed to send OTP email:', error);

            throw new BadRequestException(
                'ارسال کد تایید به ایمیل با مشکل مواجه شد',
            );
        }
    }

    private generateOtp(): string {
        return Math.floor(
            100000 + Math.random() * 900000,
        ).toString();
    }
}

