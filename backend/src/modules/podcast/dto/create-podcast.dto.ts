import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
} from 'class-validator';
import { PodcastStatus } from '../enums/podcast-status.enum';
import {
    IsHttpUrl,
    IsHttpUrlOrRootRelative,
} from './validators/podcast-url.validator';

export class CreatePodcastDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @Matches(/\S/, { message: 'title must not be blank' })
    title: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @Matches(/^[^\s/]+$/, {
        message: 'slug must not contain whitespace or slashes',
    })
    slug: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    episodeNumber?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    durationSeconds?: number;

    @IsOptional()
    @IsHttpUrl()
    @MaxLength(2048)
    audioUrl?: string | null;

    @IsOptional()
    @IsHttpUrl()
    @MaxLength(2048)
    videoUrl?: string | null;

    @IsOptional()
    @IsHttpUrlOrRootRelative()
    @MaxLength(2048)
    coverImageUrl?: string | null;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    guest?: string | null;

    @IsOptional()
    @IsEnum(PodcastStatus)
    status?: PodcastStatus;
}
