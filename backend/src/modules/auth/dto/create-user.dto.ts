import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString() name: string;

    // prettier-ignore
    @IsString() @MinLength(8, { message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' }) password: string;
}
