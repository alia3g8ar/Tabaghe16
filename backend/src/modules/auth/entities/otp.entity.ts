import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Otp extends BaseEntity {
    @Column({ unique: true, length: 255 }) email: string;

    // prettier-ignore
    @Column({ type: 'varchar', length: 255, nullable: true }) name: string | null;

    @Column({ length: 60 }) codeHash: string;

    @Column({ type: 'timestamp' }) expiresAt: Date;

    @Column({ type: 'int', unsigned: true, default: 0 }) attempts: number;

    @Column({ type: 'timestamp' }) lastSentAt: Date;
}
