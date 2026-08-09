import { IsEmail } from 'class-validator';

export class CheckNameDto {
    @IsEmail() email: string;
}
