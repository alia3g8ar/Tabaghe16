import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from './podcast.entity';

@Entity('podcast_comment')
export class PodcastComment extends BaseEntity {
    @Column({ type: 'text' })
    content: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Index('IDX_podcast_comment_user')
    @Column({ type: 'bigint' })
    userId: number;

    @ManyToOne(() => Podcast, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'podcastId' })
    podcast: Podcast;

    @Index('IDX_podcast_comment_podcast')
    @Column({ type: 'bigint' })
    podcastId: number;
}
