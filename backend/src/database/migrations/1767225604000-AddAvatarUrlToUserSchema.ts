import {
    MigrationInterface,
    QueryRunner,
    TableColumn,
} from 'typeorm';

const TABLE_NAME = 'user';
const AVATAR_URL_COLUMN = 'avatarUrl';

export class AddAvatarUrlToUserSchema1767225604000
    implements MigrationInterface
{
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            return;
        }

        const table = await queryRunner.getTable(TABLE_NAME);

        if (!table) {
            throw new Error('Unable to inspect the user table');
        }

        if (!table.findColumnByName(AVATAR_URL_COLUMN)) {
            await queryRunner.addColumn(
                TABLE_NAME,
                new TableColumn({
                    name: AVATAR_URL_COLUMN,
                    type: 'varchar',
                    length: '500',
                    isNullable: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            return;
        }

        const table = await queryRunner.getTable(TABLE_NAME);

        if (table?.findColumnByName(AVATAR_URL_COLUMN)) {
            await queryRunner.dropColumn(TABLE_NAME, AVATAR_URL_COLUMN);
        }
    }
}
