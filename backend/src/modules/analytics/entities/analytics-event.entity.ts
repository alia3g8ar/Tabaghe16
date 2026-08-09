import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class AnalyticsEvent extends BaseEntity {
    @Index() @Column({ length: 64 }) eventType: string;

    @Column({ length: 64 }) sessionId: string;

    @Column({ type: 'bigint', nullable: true }) userId: number | null;

    @Column({ type: 'bigint', nullable: true }) podcastId: number | null;

    // prettier-ignore
    @Column({ type: 'json', nullable: true }) meta: Record<string, unknown> | null;

    @Index() @Column({ type: 'timestamp' }) occurredAt: Date;
}
