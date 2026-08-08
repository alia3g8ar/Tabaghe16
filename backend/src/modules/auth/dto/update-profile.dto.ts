import {
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @Matches(/\S/, { message: 'name must not be blank' })
    name?: string | null;

    @IsOptional()
    @IsString()
    @Matches(/^\+?[0-9]{10,15}$/, {
        message: 'phone must be a valid phone number',
    })
    phone?: string | null;
}
