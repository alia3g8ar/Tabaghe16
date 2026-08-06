import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from 'typeorm';

const TABLE_NAME = 'otp';
const EMAIL_INDEX_NAME = 'IDX_otp_email_unique';
const EXPIRES_AT_INDEX_NAME = 'IDX_otp_expires_at';

function otpColumns(): TableColumn[] {
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
            name: 'email',
            type: 'varchar',
            length: '255',
        }),
        new TableColumn({
            name: 'codeHash',
            type: 'varchar',
            length: '60',
        }),
        new TableColumn({
            name: 'expiresAt',
            type: 'timestamp',
            precision: 6,
        }),
        new TableColumn({
            name: 'attempts',
            type: 'int',
            unsigned: true,
            default: '0',
        }),
        new TableColumn({
            name: 'lastSentAt',
            type: 'timestamp',
            precision: 6,
        }),
    ];
}

function emailIndex(): TableIndex {
    return new TableIndex({
        name: EMAIL_INDEX_NAME,
        columnNames: ['email'],
        isUnique: true,
    });
}

function expiresAtIndex(): TableIndex {
    return new TableIndex({
        name: EXPIRES_AT_INDEX_NAME,
        columnNames: ['expiresAt'],
    });
}

function hasUniqueEmailIndex(table: Table): boolean {
    return (
        table.findColumnByName('email')?.isUnique === true ||
        table.indices.some(
            (index) =>
                index.isUnique &&
                index.columnNames.length === 1 &&
                index.columnNames[0] === 'email',
        ) ||
        table.uniques.some(
            (unique) =>
                unique.columnNames.length === 1 &&
                unique.columnNames[0] === 'email',
        )
    );
}

function hasExpiresAtIndex(table: Table): boolean {
    return table.indices.some(
        (index) =>
            index.name === EXPIRES_AT_INDEX_NAME ||
            (index.columnNames.length === 1 &&
                index.columnNames[0] === 'expiresAt'),
    );
}

export class CreateOtpSchema1786000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            await queryRunner.createTable(
                new Table({
                    name: TABLE_NAME,
                    columns: otpColumns(),
                    indices: [emailIndex(), expiresAtIndex()],
                }),
            );

            return;
        }

        const existingTable = await queryRunner.getTable(TABLE_NAME);

        if (!existingTable) {
            throw new Error('Unable to inspect the existing otp table.');
        }

        const requiredColumns = [
            'id',
            'email',
            'codeHash',
            'expiresAt',
            'attempts',
            'lastSentAt',
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
                    `Cannot safely add required otp columns to a populated table: ${missingRequiredColumns.join(', ')}`,
                );
            }
        }

        for (const column of otpColumns()) {
            if (!existingTable.findColumnByName(column.name)) {
                await queryRunner.addColumn(TABLE_NAME, column);
            }
        }

        const refreshedTable = await queryRunner.getTable(TABLE_NAME);

        if (!refreshedTable) {
            throw new Error('Unable to refresh the otp table schema.');
        }

        if (!hasUniqueEmailIndex(refreshedTable)) {
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
                    'Cannot create the unique otp email index because duplicate emails exist.',
                );
            }

            await queryRunner.createIndex(TABLE_NAME, emailIndex());
        }

        if (!hasExpiresAtIndex(refreshedTable)) {
            await queryRunner.createIndex(TABLE_NAME, expiresAtIndex());
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // WARNING: This rollback is destructive and removes all OTP records.
        if (await queryRunner.hasTable(TABLE_NAME)) {
            await queryRunner.dropTable(TABLE_NAME);
        }
    }
}
