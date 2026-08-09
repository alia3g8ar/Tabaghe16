import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class SendEmailDto {
    @IsEmail() email: string;

    @IsOptional() @IsString() @MaxLength(255) name?: string;
}
