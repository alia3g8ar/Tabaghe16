import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class UserSession extends BaseEntity {
    @Index()
    @Column({ length: 64 }) sessionId: string;

    @Column({ type: 'bigint', nullable: true }) userId: number | null;

    @Column({ type: 'timestamp' }) startedAt: Date;

    @Column({ type: 'timestamp', nullable: true }) endedAt: Date | null;

    @Column({ type: 'int', nullable: true }) durationSeconds: number | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    userAgent: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true }) ip: string | null;
}
