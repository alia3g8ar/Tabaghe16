import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class RecordWatchDto {
    @IsString()
    @MaxLength(64)
    sessionId: string;

    @Type(() => Number)
    @IsInt()
    podcastId: number;

    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(3600)
    watchSeconds: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    userId?: number;
}
