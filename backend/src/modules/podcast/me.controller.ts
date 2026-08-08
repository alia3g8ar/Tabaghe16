import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { PodcastService } from './podcast.service';

type AuthRequest = Request & {
    user: {
        sub: number | string;
        role: string;
    };
};

@Controller('me')
export class MeController {
    constructor(private readonly podcastService: PodcastService) {}

    @Get('saved-podcasts')
    findSavedPodcasts(@Req() request: AuthRequest) {
        return this.podcastService.findSavedPodcasts(request.user.sub);
    }
}
