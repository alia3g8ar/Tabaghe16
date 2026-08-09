import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class AnalyticsDaily extends BaseEntity {
    @Index({ unique: true }) @Column({ type: 'date' }) date: string;

    @Column({ type: 'int', unsigned: true, default: 0 }) sessions: number;

    @Column({ type: 'int', unsigned: true, default: 0 }) logins: number;

    @Column({ type: 'int', unsigned: true, default: 0 }) views: number;

    @Column({ type: 'bigint', default: 0 }) watchSeconds: number;
}
