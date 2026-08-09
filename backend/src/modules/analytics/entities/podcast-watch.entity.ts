import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
@Index(['podcastId', 'sessionId'], { unique: true })
export class PodcastWatch extends BaseEntity {
    @Column({ type: 'bigint' }) podcastId: number;

    @Column({ length: 64 }) sessionId: string;

    @Column({ type: 'bigint', nullable: true }) userId: number | null;

    @Column({ type: 'timestamp' }) firstViewedAt: Date;

    @Column({ type: 'timestamp' }) lastViewedAt: Date;

    @Column({ type: 'int', default: 0 }) watchSeconds: number;
}
