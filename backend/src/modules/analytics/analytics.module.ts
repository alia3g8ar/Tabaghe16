import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from 'src/modules/podcast/entities/podcast.entity';
import { PodcastComment } from 'src/modules/podcast/entities/podcast-comment.entity';
import { PodcastLike } from 'src/modules/podcast/entities/podcast-like.entity';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsDaily } from './entities/analytics-daily.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { PodcastWatch } from './entities/podcast-watch.entity';
import { UserSession } from './entities/user-session.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserSession,
            PodcastWatch,
            AnalyticsEvent,
            AnalyticsDaily,
            User,
            Podcast,
            PodcastComment,
            PodcastLike,
        ]),
    ],
    controllers: [AnalyticsController, AdminAnalyticsController],
    providers: [AnalyticsService],
})
export class AnalyticsModule {}
