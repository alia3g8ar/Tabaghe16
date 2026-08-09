import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from 'typeorm';

function sessionTable(): Table {
    return new Table({
        name: 'user_session',
        columns: [
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
                name: 'sessionId',
                type: 'varchar',
                length: '64',
            }),
            new TableColumn({
                name: 'userId',
                type: 'bigint',
                isNullable: true,
            }),
            new TableColumn({
                name: 'startedAt',
                type: 'timestamp',
                precision: 6,
            }),
            new TableColumn({
                name: 'endedAt',
                type: 'timestamp',
                precision: 6,
                isNullable: true,
            }),
            new TableColumn({
                name: 'durationSeconds',
                type: 'int',
                isNullable: true,
            }),
            new TableColumn({
                name: 'userAgent',
                type: 'varchar',
                length: '500',
                isNullable: true,
            }),
            new TableColumn({
                name: 'ip',
                type: 'varchar',
                length: '64',
                isNullable: true,
            }),
        ],
        indices: [
            new TableIndex({
                name: 'IDX_user_session_sessionId',
                columnNames: ['sessionId'],
            }),
            new TableIndex({
                name: 'IDX_user_session_startedAt',
                columnNames: ['startedAt'],
            }),
        ],
    });
}

function podcastWatchTable(): Table {
    return new Table({
        name: 'podcast_watch',
        columns: [
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
                name: 'podcastId',
                type: 'bigint',
            }),
            new TableColumn({
                name: 'sessionId',
                type: 'varchar',
                length: '64',
            }),
            new TableColumn({
                name: 'userId',
                type: 'bigint',
                isNullable: true,
            }),
            new TableColumn({
                name: 'firstViewedAt',
                type: 'timestamp',
                precision: 6,
            }),
            new TableColumn({
                name: 'lastViewedAt',
                type: 'timestamp',
                precision: 6,
            }),
            new TableColumn({
                name: 'watchSeconds',
                type: 'int',
                default: '0',
            }),
        ],
        indices: [
            new TableIndex({
                name: 'IDX_podcast_watch_podcast_session',
                columnNames: ['podcastId', 'sessionId'],
                isUnique: true,
            }),
            new TableIndex({
                name: 'IDX_podcast_watch_lastViewedAt',
                columnNames: ['lastViewedAt'],
            }),
        ],
    });
}

function analyticsEventTable(): Table {
    return new Table({
        name: 'analytics_event',
        columns: [
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
                name: 'eventType',
                type: 'varchar',
                length: '64',
            }),
            new TableColumn({
                name: 'sessionId',
                type: 'varchar',
                length: '64',
            }),
            new TableColumn({
                name: 'userId',
                type: 'bigint',
                isNullable: true,
            }),
            new TableColumn({
                name: 'podcastId',
                type: 'bigint',
                isNullable: true,
            }),
            new TableColumn({
                name: 'meta',
                type: 'json',
                isNullable: true,
            }),
            new TableColumn({
                name: 'occurredAt',
                type: 'timestamp',
                precision: 6,
            }),
        ],
        indices: [
            new TableIndex({
                name: 'IDX_analytics_event_type',
                columnNames: ['eventType'],
            }),
            new TableIndex({
                name: 'IDX_analytics_event_occurredAt',
                columnNames: ['occurredAt'],
            }),
        ],
    });
}

export class CreateAnalyticsSchema1786308349000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (!(await queryRunner.hasTable('user_session'))) {
            await queryRunner.createTable(sessionTable());
        }

        if (!(await queryRunner.hasTable('podcast_watch'))) {
            await queryRunner.createTable(podcastWatchTable());
        }

        if (!(await queryRunner.hasTable('analytics_event'))) {
            await queryRunner.createTable(analyticsEventTable());
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // WARNING: This rollback is destructive and removes all analytics data.
        for (const tableName of [
            'analytics_event',
            'podcast_watch',
            'user_session',
        ]) {
            if (await queryRunner.hasTable(tableName)) {
                await queryRunner.dropTable(tableName);
            }
        }
    }
}
