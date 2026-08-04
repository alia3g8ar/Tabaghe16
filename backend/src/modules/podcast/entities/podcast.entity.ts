import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';
import { PodcastStatus } from '../enums/podcast-status.enum';

@Entity()
export class Podcast extends BaseEntity {
    @Column({ type: 'varchar', length: 255 }) title: string;

    @Column({ type: 'varchar', length: 255, unique: true }) slug: string;

    @Column({ type: 'text', nullable: true }) description: string | null;

    @Column({ type: 'int', unsigned: true, nullable: true }) episodeNumber:
        | number
        | null;

    @Column({ type: 'int', unsigned: true, nullable: true }) durationSeconds:
        | number
        | null;

    @Column({ type: 'varchar', length: 2048, nullable: true }) audioUrl:
        | string
        | null;

    @Column({ type: 'varchar', length: 2048, nullable: true }) videoUrl:
        | string
        | null;

    @Column({ type: 'varchar', length: 2048, nullable: true }) coverImageUrl:
        | string
        | null;

    @Column({ type: 'varchar', length: 255, nullable: true }) guest:
        | string
        | null;

    // prettier-ignore
    @Column({ type: 'enum', enum: PodcastStatus, default: PodcastStatus.DRAFT }) status: PodcastStatus;

    @Column({ type: 'timestamp', nullable: true }) publishedAt: Date | null;
}
