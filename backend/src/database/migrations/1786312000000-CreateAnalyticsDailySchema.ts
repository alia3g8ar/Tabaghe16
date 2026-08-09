import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumn,
    TableIndex,
} from 'typeorm';

export class CreateAnalyticsDailySchema1786312000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        if (await queryRunner.hasTable('analytics_daily')) {
            return;
        }

        await queryRunner.createTable(
            new Table({
                name: 'analytics_daily',
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
                        name: 'date',
                        type: 'date',
                    }),
                    new TableColumn({
                        name: 'sessions',
                        type: 'int',
                        unsigned: true,
                        default: '0',
                    }),
                    new TableColumn({
                        name: 'logins',
                        type: 'int',
                        unsigned: true,
                        default: '0',
                    }),
                    new TableColumn({
                        name: 'views',
                        type: 'int',
                        unsigned: true,
                        default: '0',
                    }),
                    new TableColumn({
                        name: 'watchSeconds',
                        type: 'bigint',
                        default: '0',
                    }),
                ],
                indices: [
                    new TableIndex({
                        name: 'IDX_analytics_daily_date',
                        columnNames: ['date'],
                        isUnique: true,
                    }),
                ],
            }),
        );

        // Backfill the rollup from the raw analytics tables so pre-existing
        // data is immediately available in the daily aggregates.
        await this.backfillFromRawTables(queryRunner);
    }

    private async backfillFromRawTables(
        queryRunner: QueryRunner,
    ): Promise<void> {
        const statements = [
            `INSERT INTO analytics_daily (\`date\`, \`sessions\`)
             SELECT DATE(startedAt), COUNT(*)
             FROM user_session
             GROUP BY DATE(startedAt)
             ON DUPLICATE KEY UPDATE \`sessions\` = \`sessions\` + VALUES(\`sessions\`)`,
            `INSERT INTO analytics_daily (\`date\`, \`logins\`)
             SELECT DATE(occurredAt), COUNT(*)
             FROM analytics_event
             WHERE eventType = 'login'
             GROUP BY DATE(occurredAt)
             ON DUPLICATE KEY UPDATE \`logins\` = \`logins\` + VALUES(\`logins\`)`,
            `INSERT INTO analytics_daily (\`date\`, \`views\`)
             SELECT DATE(firstViewedAt), COUNT(*)
             FROM podcast_watch
             GROUP BY DATE(firstViewedAt)
             ON DUPLICATE KEY UPDATE \`views\` = \`views\` + VALUES(\`views\`)`,
            `INSERT INTO analytics_daily (\`date\`, \`watchSeconds\`)
             SELECT DATE(firstViewedAt), SUM(watchSeconds)
             FROM podcast_watch
             GROUP BY DATE(firstViewedAt)
             ON DUPLICATE KEY UPDATE \`watchSeconds\` = \`watchSeconds\` + VALUES(\`watchSeconds\`)`,
        ];

        for (const statement of statements) {
            await queryRunner.query(statement);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // WARNING: This rollback is destructive and removes all daily rollups.
        if (await queryRunner.hasTable('analytics_daily')) {
            await queryRunner.dropTable('analytics_daily');
        }
    }
}
