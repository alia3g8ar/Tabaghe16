import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { IsPublic } from 'src/common/decorators/public.decorator';
import { AnalyticsService } from './analytics.service';
import { RecordEventDto } from './dto/record-event.dto';
import { RecordSessionDto } from './dto/record-session.dto';
import { RecordWatchDto } from './dto/record-watch.dto';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Post('session')
    @IsPublic()
    async recordSession(@Body() dto: RecordSessionDto, @Req() req: Request) {
        return this.analyticsService.recordSession(dto, this.extractIp(req));
    }

    @Post('events')
    @IsPublic()
    async recordEvents(@Body() dto: RecordEventDto) {
        return this.analyticsService.recordEvents(dto);
    }

    @Post('watch')
    @IsPublic()
    async recordWatch(@Body() dto: RecordWatchDto) {
        return this.analyticsService.recordWatch(dto);
    }

    private extractIp(req: Request): string | null {
        const forwarded = req.headers['x-forwarded-for'];

        if (typeof forwarded === 'string' && forwarded) {
            const first = forwarded.split(',')[0]?.trim();
            if (first) {
                return first.slice(0, 64);
            }
        }

        return req.ip?.slice(0, 64) ?? null;
    }
}
