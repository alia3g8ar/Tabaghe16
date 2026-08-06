import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from 'typeorm';

const TABLE_NAME = 'user';
const EMAIL_INDEX_NAME = 'IDX_e12875dfb3b1d92d7d7c5377e2';

function userColumns(): TableColumn[] {
    return [
        new TableColumn({
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
        }),
        new TableColumn({
            name: 'createdAt',
            type: 'timestamp',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
        }),
        new TableColumn({
            name: 'updatedAt',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
        }),
        new TableColumn({
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }),
        new TableColumn({
            name: 'email',
            type: 'varchar',
            length: '255',
        }),
        new TableColumn({
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }),
        new TableColumn({
            name: 'role',
            type: 'varchar',
            length: '255',
            default: "'user'",
        }),
        new TableColumn({
            name: 'refreshToken',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }),
        new TableColumn({
            name: 'is_verified',
            type: 'tinyint',
            default: '0',
        }),
    ];
}

export class CreateUserSchema1767225601000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            await queryRunner.createTable(
                new Table({
                    name: TABLE_NAME,
                    columns: userColumns(),
                    indices: [
                        new TableIndex({
                            name: EMAIL_INDEX_NAME,
                            columnNames: ['email'],
                            isUnique: true,
                        }),
                    ],
                }),
            );

            return;
        }

        const existingTable = await queryRunner.getTable(TABLE_NAME);

        if (!existingTable) {
            throw new Error('Unable to inspect the existing user table.');
        }

        const requiredColumns = [
            'id',
            'createdAt',
            'updatedAt',
            'email',
            'role',
            'is_verified',
        ];

        const missingRequiredColumns = requiredColumns.filter(
            (columnName) => !existingTable.findColumnByName(columnName),
        );

        if (missingRequiredColumns.length > 0) {
            const result = (await queryRunner.query(
                `SELECT COUNT(*) AS count FROM \`${TABLE_NAME}\``,
            )) as Array<{ count: number | string }>;

            const rowCount = Number(result[0]?.count ?? 0);

            if (rowCount > 0) {
                throw new Error(
                    `Cannot safely add required user columns to a populated table: ${missingRequiredColumns.join(', ')}`,
                );
            }
        }

        for (const column of userColumns()) {
            if (!existingTable.findColumnByName(column.name)) {
                await queryRunner.addColumn(TABLE_NAME, column);
            }
        }

        const refreshedTable = await queryRunner.getTable(TABLE_NAME);

        if (!refreshedTable) {
            throw new Error('Unable to refresh the user table schema.');
        }

        for (const columnName of ['name', 'password', 'refreshToken']) {
            const column = refreshedTable.findColumnByName(columnName);

            if (column && !column.isNullable) {
                const nullableColumn = column.clone();
                nullableColumn.isNullable = true;

                await queryRunner.changeColumn(
                    TABLE_NAME,
                    column,
                    nullableColumn,
                );
            }
        }

        const latestTable = await queryRunner.getTable(TABLE_NAME);

        if (!latestTable) {
            throw new Error('Unable to inspect the updated user table.');
        }

        const hasUniqueEmailIndex =
            latestTable.findColumnByName('email')?.isUnique === true ||
            latestTable.indices.some(
                (index) =>
                    index.isUnique &&
                    index.columnNames.length === 1 &&
                    index.columnNames[0] === 'email',
            ) ||
            latestTable.uniques.some(
                (unique) =>
                    unique.columnNames.length === 1 &&
                    unique.columnNames[0] === 'email',
            );

        if (!hasUniqueEmailIndex) {
            const duplicates = (await queryRunner.query(
                `
                SELECT \`email\`, COUNT(*) AS count
                FROM \`${TABLE_NAME}\`
                GROUP BY \`email\`
                HAVING COUNT(*) > 1
                LIMIT 1
                `,
            )) as Array<{ email: string; count: number | string }>;

            if (duplicates.length > 0) {
                throw new Error(
                    'Cannot create the unique user email index because duplicate emails exist.',
                );
            }

            await queryRunner.createIndex(
                TABLE_NAME,
                new TableIndex({
                    name: EMAIL_INDEX_NAME,
                    columnNames: ['email'],
                    isUnique: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // WARNING: This rollback is destructive and removes all user data.
        if (await queryRunner.hasTable(TABLE_NAME)) {
            await queryRunner.dropTable(TABLE_NAME);
        }
    }
}
