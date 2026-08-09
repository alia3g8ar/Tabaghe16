import { IsIn, IsOptional } from 'class-validator';

export type AnalyticsRange = 'today' | 'week' | 'month' | 'year';

export class AdminAnalyticsQueryDto {
    // prettier-ignore
    @IsOptional() @IsIn(['today', 'week', 'month', 'year']) range?: AnalyticsRange;
}
