import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from './podcast.entity';

@Entity('podcast_comment')
export class PodcastComment extends BaseEntity {
    @Column({ type: 'text' }) content: string;

    // prettier-ignore
    @ManyToOne(() => User, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'userId' }) user: User;

    // prettier-ignore
    @Index('IDX_podcast_comment_user') @Column({ type: 'bigint' }) userId: number;

    // prettier-ignore
    @ManyToOne(() => Podcast, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'podcastId' }) podcast: Podcast;

    // prettier-ignore
    @Index('IDX_podcast_comment_podcast') @Column({ type: 'bigint' }) podcastId: number;
}
