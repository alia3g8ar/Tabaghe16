import { Controller, Get, Query } from '@nestjs/common';
import { Role } from 'src/common/decorators/role.decorator';
import { roleEnum } from 'src/common/enums/role.enum';
import { AdminAnalyticsQueryDto } from './dto/admin-analytics-query.dto';
import { AnalyticsService } from './analytics.service';

@Controller('admin/analytics')
@Role([roleEnum.ADMIN, roleEnum.OWNER])
export class AdminAnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) {}

    @Get()
    getOverview(@Query() query: AdminAnalyticsQueryDto) {
        return this.analyticsService.getOverview(query.range);
    }
}
