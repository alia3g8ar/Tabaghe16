import { BaseEntity } from 'src/common/entities/base.entity';
import { roleEnum } from 'src/common/enums/role.enum';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends BaseEntity {
    @Column({ type: 'varchar', nullable: true }) name: string | null;

    @Column({ unique: true }) email: string;

    @Column({ nullable: true }) password: string;

    // prettier-ignore
    @Column({ type: 'varchar', length: 32, default: roleEnum.USER }) role: roleEnum;

    // prettier-ignore
    @Column({ type: 'varchar', length: 20, nullable: true }) phone?: string | null;

    // prettier-ignore
    @Column({ type: 'varchar', length: 500, nullable: true }) avatarUrl?: string | null;

    @Column({ nullable: true }) refreshToken?: string;

    @Column({ default: false }) is_verified: boolean;
}
