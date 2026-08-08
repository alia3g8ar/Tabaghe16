import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from './podcast.entity';

@Entity('saved_podcast')
@Unique('UQ_saved_podcast_user_podcast', ['userId', 'podcastId'])
export class SavedPodcast extends BaseEntity {
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
