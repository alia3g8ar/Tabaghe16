import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const TABLE_NAME = 'user';
const PHONE_COLUMN = 'phone';

export class AddPhoneToUserSchema1767225603000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            return;
        }

        const table = await queryRunner.getTable(TABLE_NAME);

        if (!table) {
            throw new Error('Unable to inspect the user table');
        }

        if (!table.findColumnByName(PHONE_COLUMN)) {
            await queryRunner.addColumn(
                TABLE_NAME,
                new TableColumn({
                    name: PHONE_COLUMN,
                    type: 'varchar',
                    length: '20',
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

        if (table?.findColumnByName(PHONE_COLUMN)) {
            await queryRunner.dropColumn(TABLE_NAME, PHONE_COLUMN);
        }
    }
}
