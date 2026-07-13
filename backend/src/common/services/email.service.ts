import { BadRequestException, Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'anatomy.atlas15@gmail.com',
                pass: 'jiqi qxfp bgak nwjw',
            },
        });
    }
    // process.env.PASSWORD_EMAILprocess.env.EMAIL
    // async sendOtp(email: string) {
    //     const otpCode = this.generateOtp();
    //     // not found file
    //     // const pathFile = path.join(
    //     //     __dirname,
    //     //     "..",
    //     //     "..",
    //     //     "public",
    //     //     "html",
    //     //     "email.html")
    //     let file = fs.readFileSync("./email.html", "utf-8")
    //         .replace("{{OTP}}", otpCode)

    //     const mailOptions = {
    //         from: process.env.Email,
    //         to: email,
    //         subject: "Your OTP Code 🔐",
    //         html: file,
    //     };
    //     await this.transporter.sendMail(mailOptions, (err) => {
    //         if (err) {
    //             console.log(err);

    //             throw new BadRequestException("ارسال ایمیل به مشکل خورد")
    //         }
    //     });

    //     return otpCode;
    // }

    async sendOtp(email: string) {
        const otpCode = this.generateOtp();

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'کد تایید شما',
            html: `<h2>کد تایید: ${otpCode}</h2>`,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            return otpCode;
        } catch (err) {
            console.log(err);
            throw new BadRequestException('ارسال ایمیل به مشکل مواجه شد');
        }
    }

    private generateOtp() {
        return Math.floor(100000 + Math.random() * 900000)
            .toString()
            .slice(0, 5);
    }
}
