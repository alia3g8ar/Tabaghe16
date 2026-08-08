import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { IsPublic } from 'src/common/decorators/public.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PodcastService } from './podcast.service';

type AuthRequest = Request & {
    user: {
        sub: number | string;
        role: string;
    };
};

@Controller('podcasts')
export class PodcastInteractionController {
    constructor(private readonly podcastService: PodcastService) {}

    @Get(':slug/comments')
    @IsPublic()
    findComments(@Param('slug') slug: string) {
        return this.podcastService.findComments(slug);
    }

    @Post(':slug/comments')
    @HttpCode(201)
    createComment(
        @Param('slug') slug: string,
        @Body() dto: CreateCommentDto,
        @Req() request: AuthRequest,
    ) {
        return this.podcastService.createComment(
            slug,
            request.user.sub,
            dto,
        );
    }

    @Delete(':slug/comments/:id')
    removeComment(
        @Param('slug') slug: string,
        @Param('id', ParseIntPipe) id: number,
        @Req() request: AuthRequest,
    ) {
        return this.podcastService.removeComment(slug, id, request.user);
    }

    @Get(':slug/interactions')
    getUserInteractions(
        @Param('slug') slug: string,
        @Req() request: AuthRequest,
    ) {
        return this.podcastService.getUserInteractions(
            slug,
            request.user.sub,
        );
    }

    @Post(':slug/like')
    @HttpCode(200)
    toggleLike(
        @Param('slug') slug: string,
        @Req() request: AuthRequest,
    ) {
        return this.podcastService.toggleLike(slug, request.user.sub);
    }

    @Post(':slug/save')
    @HttpCode(200)
    toggleSave(
        @Param('slug') slug: string,
        @Req() request: AuthRequest,
    ) {
        return this.podcastService.toggleSave(slug, request.user.sub);
    }
}
