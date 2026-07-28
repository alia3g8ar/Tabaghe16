import { Controller, Get, Param, Query } from '@nestjs/common';
import { IsPublic } from 'src/common/decorators/public.decorator';
import { PodcastPaginationQueryDto } from './dto/podcast-pagination-query.dto';
import { PodcastService } from './podcast.service';

@Controller('podcasts')
@IsPublic()
export class PodcastController {
    constructor(private readonly podcastService: PodcastService) {}

    @Get()
    findPublished(@Query() query: PodcastPaginationQueryDto) {
        return this.podcastService.findPublished(query);
    }

    @Get(':slug')
    findPublishedBySlug(@Param('slug') slug: string) {
        return this.podcastService.findPublishedBySlug(slug);
    }
}
