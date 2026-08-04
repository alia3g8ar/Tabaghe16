import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from 'typeorm';

const TABLE_NAME = 'podcast';
const SLUG_INDEX_NAME = 'IDX_podcast_slug_unique';

function podcastColumns(): TableColumn[] {
    return [
        new TableColumn({
            name: 'id',
            type: 'bigint',
            unsigned: true,
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
            name: 'title',
            type: 'varchar',
            length: '255',
        }),
        new TableColumn({
            name: 'slug',
            type: 'varchar',
            length: '255',
        }),
        new TableColumn({
            name: 'description',
            type: 'text',
            isNullable: true,
        }),
        new TableColumn({
            name: 'episodeNumber',
            type: 'int',
            unsigned: true,
            isNullable: true,
        }),
        new TableColumn({
            name: 'durationSeconds',
            type: 'int',
            unsigned: true,
            isNullable: true,
        }),
        new TableColumn({
            name: 'audioUrl',
            type: 'varchar',
            length: '2048',
            isNullable: true,
        }),
        new TableColumn({
            name: 'videoUrl',
            type: 'varchar',
            length: '2048',
            isNullable: true,
        }),
        new TableColumn({
            name: 'coverImageUrl',
            type: 'varchar',
            length: '2048',
            isNullable: true,
        }),
        new TableColumn({
            name: 'guest',
            type: 'varchar',
            length: '255',
            isNullable: true,
        }),
        new TableColumn({
            name: 'status',
            type: 'enum',
            enum: ['draft', 'published'],
            default: "'draft'",
        }),
        new TableColumn({
            name: 'publishedAt',
            type: 'timestamp',
            isNullable: true,
        }),
    ];
}

export class CreatePodcastSchema1767225600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable(TABLE_NAME))) {
            await queryRunner.createTable(
                new Table({
                    name: TABLE_NAME,
                    columns: podcastColumns(),
                    indices: [
                        new TableIndex({
                            name: SLUG_INDEX_NAME,
                            columnNames: ['slug'],
                            isUnique: true,
                        }),
                    ],
                }),
            );
            return;
        }

        const existingTable = await queryRunner.getTable(TABLE_NAME);

        if (!existingTable) {
            throw new Error('Unable to inspect the existing podcast table');
        }

        const missingRequiredColumns = ['id', 'title', 'slug'].filter(
            (columnName) => !existingTable.findColumnByName(columnName),
        );

        if (missingRequiredColumns.length > 0) {
            const result = (await queryRunner.query(
                `SELECT COUNT(*) AS count FROM \`${TABLE_NAME}\``,
            )) as Array<{ count: number | string }>;
            const rowCount = Number(result[0]?.count ?? 0);

            if (rowCount > 0) {
                throw new Error(
                    `Cannot safely add required podcast columns to a populated table: ${missingRequiredColumns.join(', ')}`,
                );
            }
        }

        for (const column of podcastColumns()) {
            if (!existingTable.findColumnByName(column.name)) {
                await queryRunner.addColumn(TABLE_NAME, column);
            }
        }

        const refreshedTable = await queryRunner.getTable(TABLE_NAME);

        if (!refreshedTable) {
            throw new Error('Unable to refresh the podcast table schema');
        }

        const audioUrlColumn = refreshedTable.findColumnByName('audioUrl');

        if (audioUrlColumn && !audioUrlColumn.isNullable) {
            const nullableAudioUrlColumn = audioUrlColumn.clone();
            nullableAudioUrlColumn.isNullable = true;
            await queryRunner.changeColumn(
                TABLE_NAME,
                audioUrlColumn,
                nullableAudioUrlColumn,
            );
        }

        const hasUniqueSlugIndex =
            refreshedTable.findColumnByName('slug')?.isUnique === true ||
            refreshedTable.indices.some(
                (index) =>
                    index.isUnique &&
                    index.columnNames.length === 1 &&
                    index.columnNames[0] === 'slug',
            ) ||
            refreshedTable.uniques.some(
                (unique) =>
                    unique.columnNames.length === 1 &&
                    unique.columnNames[0] === 'slug',
            );

        if (!hasUniqueSlugIndex) {
            await queryRunner.createIndex(
                TABLE_NAME,
                new TableIndex({
                    name: SLUG_INDEX_NAME,
                    columnNames: ['slug'],
                    isUnique: true,
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // WARNING: This rollback is destructive and removes all podcast data.
        if (await queryRunner.hasTable(TABLE_NAME)) {
            await queryRunner.dropTable(TABLE_NAME);
        }
    }
}
