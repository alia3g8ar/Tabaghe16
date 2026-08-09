import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const TABLE_NAME = 'otp';
const NAME_COLUMN = 'name';

export class AddNameToOtpSchema1786311242196 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            return;
        }

        const table = await queryRunner.getTable(TABLE_NAME);

        if (!table) {
            throw new Error('Unable to inspect the otp table');
        }

        if (!table.findColumnByName(NAME_COLUMN)) {
            await queryRunner.addColumn(
                TABLE_NAME,
                new TableColumn({
                    name: NAME_COLUMN,
                    type: 'varchar',
                    length: '255',
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

        if (table?.findColumnByName(NAME_COLUMN)) {
            await queryRunner.dropColumn(TABLE_NAME, NAME_COLUMN);
        }
    }
}
