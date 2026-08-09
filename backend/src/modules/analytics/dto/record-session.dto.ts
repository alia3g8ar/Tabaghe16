import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class RecordSessionDto {
    @IsString() @MaxLength(64) sessionId: string;

    @IsIn(['start', 'heartbeat', 'end']) action: 'start' | 'heartbeat' | 'end';

    @IsOptional() @Type(() => Number) @IsInt() userId?: number;

    @IsOptional() @IsString() @MaxLength(500) userAgent?: string;
}
