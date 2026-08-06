import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PodcastStatus } from '../enums/podcast-status.enum';
import { PodcastPaginationQueryDto } from './podcast-pagination-query.dto';

export class AdminPodcastQueryDto extends PodcastPaginationQueryDto {
    @IsOptional() @IsString() @MaxLength(255) search?: string;

    @IsOptional() @IsEnum(PodcastStatus) status?: PodcastStatus;
}
