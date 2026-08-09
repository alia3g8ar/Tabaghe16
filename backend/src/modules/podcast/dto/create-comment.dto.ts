import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateCommentDto {
    // prettier-ignore
    @IsString() @IsNotEmpty() @Matches(/\S/, { message: 'comment must not be blank' }) @MaxLength(1000) content: string;
}
