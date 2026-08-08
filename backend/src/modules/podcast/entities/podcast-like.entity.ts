import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from './podcast.entity';

@Entity('podcast_like')
@Unique('UQ_podcast_like_user_podcast', ['userId', 'podcastId'])
export class PodcastLike extends BaseEntity {
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'bigint' })
    userId: number;

    @ManyToOne(() => Podcast, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'podcastId' })
    podcast: Podcast;

    @Column({ type: 'bigint' })
    podcastId: number;
}
