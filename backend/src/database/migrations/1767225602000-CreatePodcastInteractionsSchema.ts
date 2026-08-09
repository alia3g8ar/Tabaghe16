import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from 'typeorm';

const COMMENT_TABLE = 'podcast_comment';
const LIKE_TABLE = 'podcast_like';
const SAVED_TABLE = 'saved_podcast';

function baseColumns(): TableColumn[] {
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
    ];
}

function relationColumns(): TableColumn[] {
    return [
        new TableColumn({
            name: 'userId',
            type: 'bigint',
            isNullable: false,
        }),
        new TableColumn({
            name: 'podcastId',
            type: 'bigint',
            isNullable: false,
        }),
    ];
}

export class CreatePodcastInteractionsSchema1767225602000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Comments
        if (!(await queryRunner.hasTable(COMMENT_TABLE))) {
            await queryRunner.createTable(
                new Table({
                    name: COMMENT_TABLE,
                    columns: [
                        ...baseColumns(),
                        new TableColumn({
                            name: 'content',
                            type: 'text',
                        }),
                        ...relationColumns(),
                    ],
                    indices: [
                        new TableIndex({
                            name: 'IDX_podcast_comment_podcast',
                            columnNames: ['podcastId'],
                        }),
                        new TableIndex({
                            name: 'IDX_podcast_comment_user',
                            columnNames: ['userId'],
                        }),
                    ],
                }),
            );
        }

        // Likes
        if (!(await queryRunner.hasTable(LIKE_TABLE))) {
            await queryRunner.createTable(
                new Table({
                    name: LIKE_TABLE,
                    columns: [...baseColumns(), ...relationColumns()],
                    indices: [
                        new TableIndex({
                            name: 'UQ_podcast_like_user_podcast',
                            columnNames: ['userId', 'podcastId'],
                            isUnique: true,
                        }),
                    ],
                }),
            );
        }

        // Saved podcasts
        if (!(await queryRunner.hasTable(SAVED_TABLE))) {
            await queryRunner.createTable(
                new Table({
                    name: SAVED_TABLE,
                    columns: [...baseColumns(), ...relationColumns()],
                    indices: [
                        new TableIndex({
                            name: 'UQ_saved_podcast_user_podcast',
                            columnNames: ['userId', 'podcastId'],
                            isUnique: true,
                        }),
                    ],
                }),
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // WARNING: This rollback is destructive and removes interaction data.
        for (const tableName of [COMMENT_TABLE, LIKE_TABLE, SAVED_TABLE]) {
            if (await queryRunner.hasTable(tableName)) {
                await queryRunner.dropTable(tableName);
            }
        }
    }
}
