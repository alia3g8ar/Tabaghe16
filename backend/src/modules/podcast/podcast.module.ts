import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminPodcastController } from './admin-podcast.controller';
import { Podcast } from './entities/podcast.entity';
import { PodcastController } from './podcast.controller';
import { PodcastService } from './podcast.service';

@Module({
    imports: [TypeOrmModule.forFeature([Podcast])],
    controllers: [PodcastController, AdminPodcastController],
    providers: [PodcastService],
})
export class PodcastModule {}
