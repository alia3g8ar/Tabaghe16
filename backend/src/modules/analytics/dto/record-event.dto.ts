import { Type } from 'class-transformer';
import {
    IsArray,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

export class AnalyticsEventItemDto {
    @IsString() @MaxLength(64) eventType: string;

    @IsOptional() @Type(() => Number) @IsInt() podcastId?: number;

    @IsOptional() @IsObject() meta?: Record<string, unknown>;
}

export class RecordEventDto {
    @IsString() @MaxLength(64) sessionId: string;

    @IsOptional() @Type(() => Number) @IsInt() userId?: number;

    // prettier-ignore
    @IsArray() @ValidateNested({ each: true }) @Type(() => AnalyticsEventItemDto) events: AnalyticsEventItemDto[];
}
