import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class OtpCodeDto {
    @IsEmail() email: string;

    // prettier-ignore
    @IsNotEmpty() @Matches(/^\d{6}$/, { message: 'کد باید دقیقا ۶ رقم باشد' }) code: string;
}
