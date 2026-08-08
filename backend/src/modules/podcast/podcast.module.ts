import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { AdminPodcastController } from './admin-podcast.controller';
import { Podcast } from './entities/podcast.entity';
import { PodcastComment } from './entities/podcast-comment.entity';
import { PodcastLike } from './entities/podcast-like.entity';
import { SavedPodcast } from './entities/saved-podcast.entity';
import { PodcastController } from './podcast.controller';
import { PodcastInteractionController } from './podcast-interaction.controller';
import { MeController } from './me.controller';
import { PodcastService } from './podcast.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Podcast,
            User,
            PodcastComment,
            PodcastLike,
            SavedPodcast,
        ]),
    ],
    controllers: [
        PodcastController,
        AdminPodcastController,
        PodcastInteractionController,
        MeController,
    ],
    providers: [PodcastService],
})
export class PodcastModule {}
