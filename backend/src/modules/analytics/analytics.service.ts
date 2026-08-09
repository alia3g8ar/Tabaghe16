import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from 'src/modules/podcast/entities/podcast.entity';
import { PodcastComment } from 'src/modules/podcast/entities/podcast-comment.entity';
import { PodcastLike } from 'src/modules/podcast/entities/podcast-like.entity';
import { PodcastStatus } from 'src/modules/podcast/enums/podcast-status.enum';
import { AnalyticsDaily } from './entities/analytics-daily.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { PodcastWatch } from './entities/podcast-watch.entity';
import { UserSession } from './entities/user-session.entity';
import { AnalyticsRange } from './dto/admin-analytics-query.dto';
import { RecordEventDto } from './dto/record-event.dto';
import { RecordSessionDto } from './dto/record-session.dto';
import { RecordWatchDto } from './dto/record-watch.dto';

type CountRow = { count: string };
type SumRow = { total: string };
type AvgRow = { avg: string };
type TrendRow = { bucket: string; count: string; avgDurationSeconds?: string };
type TopWatchRow = {
    podcastId: string;
    views: string;
    watchSeconds: string;
    viewers: string;
};
type PodcastCountRow = { podcastId: string; count: string };

const RANGE_START: Record<AnalyticsRange, string> = {
    today: 'CURDATE()',
    week: 'CURDATE() - INTERVAL 7 DAY',
    month: 'CURDATE() - INTERVAL 1 MONTH',
    year: 'CURDATE() - INTERVAL 1 YEAR',
};

const DEFAULT_RANGE: AnalyticsRange = 'week';

@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(UserSession)
        private readonly sessionRepository: Repository<UserSession>,
        @InjectRepository(PodcastWatch)
        private readonly watchRepository: Repository<PodcastWatch>,
        @InjectRepository(AnalyticsEvent)
        private readonly eventRepository: Repository<AnalyticsEvent>,
        @InjectRepository(AnalyticsDaily)
        private readonly dailyRepository: Repository<AnalyticsDaily>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Podcast)
        private readonly podcastRepository: Repository<Podcast>,
        @InjectRepository(PodcastComment)
        private readonly commentRepository: Repository<PodcastComment>,
        @InjectRepository(PodcastLike)
        private readonly likeRepository: Repository<PodcastLike>,
    ) {}

    // ---------------------------------------------------------------
    // Recording (public endpoints)
    // ---------------------------------------------------------------

    async recordSession(dto: RecordSessionDto, ip: string | null) {
        const now = new Date();
        const session = await this.sessionRepository.findOneBy({
            sessionId: dto.sessionId,
        });

        if (dto.action === 'start') {
            if (!session) {
                await this.sessionRepository.save(
                    this.sessionRepository.create({
                        sessionId: dto.sessionId,
                        userId: dto.userId ?? null,
                        startedAt: now,
                        endedAt: now,
                        durationSeconds: 0,
                        userAgent: dto.userAgent ?? null,
                        ip,
                    }),
                );
                await this.incrementDaily({ sessions: 1 });
            } else {
                await this.sessionRepository.update(session.id, {
                    userId: dto.userId ?? session.userId,
                    userAgent: dto.userAgent ?? session.userAgent,
                    ip: ip ?? session.ip,
                });
            }
            return { message: 'session started' };
        }

        if (session) {
            const durationSeconds = Math.max(
                0,
                Math.floor(
                    (now.getTime() - session.startedAt.getTime()) / 1000,
                ),
            );

            await this.sessionRepository.update(session.id, {
                endedAt: now,
                durationSeconds,
                userId: dto.userId ?? session.userId,
            });
        }

        return { message: 'session updated' };
    }

    async recordEvents(dto: RecordEventDto) {
        if (dto.events.length === 0) {
            return { message: 'no events recorded' };
        }

        const now = new Date();

        await this.eventRepository.save(
            dto.events.map((event) =>
                this.eventRepository.create({
                    eventType: event.eventType,
                    sessionId: dto.sessionId,
                    userId: dto.userId ?? null,
                    podcastId: event.podcastId ?? null,
                    meta: event.meta ?? null,
                    occurredAt: now,
                }),
            ),
        );

        const loginCount = dto.events.filter(
            (event) => event.eventType === 'login',
        ).length;

        if (loginCount > 0) {
            await this.incrementDaily({ logins: loginCount });
        }

        return { message: 'events recorded' };
    }

    async recordWatch(dto: RecordWatchDto) {
        // Cap the per-call delta so a misbehaving client cannot inflate totals.
        const delta = Math.max(0, Math.min(dto.watchSeconds, 3600));
        const now = new Date();
        const existing = await this.watchRepository.findOneBy({
            podcastId: dto.podcastId,
            sessionId: dto.sessionId,
        });

        if (existing) {
            await this.watchRepository.increment(
                { id: existing.id },
                'watchSeconds',
                delta,
            );
            await this.watchRepository.update(existing.id, {
                lastViewedAt: now,
                userId: dto.userId ?? existing.userId,
            });

            if (delta > 0) {
                await this.incrementDaily({ watchSeconds: delta });
            }
        } else {
            await this.watchRepository.save(
                this.watchRepository.create({
                    podcastId: dto.podcastId,
                    sessionId: dto.sessionId,
                    userId: dto.userId ?? null,
                    firstViewedAt: now,
                    lastViewedAt: now,
                    watchSeconds: delta,
                }),
            );

            await this.incrementDaily({
                views: 1,
                watchSeconds: delta,
            });
        }

        return { message: 'watch recorded' };
    }

    // ---------------------------------------------------------------
    // Admin overview
    // ---------------------------------------------------------------

    async getOverview(range: AnalyticsRange = DEFAULT_RANGE) {
        const rangeStart = RANGE_START[range];
        const granularity: 'hour' | 'day' = range === 'today' ? 'hour' : 'day';
        const bucket = (column: string) =>
            granularity === 'hour'
                ? `DATE_FORMAT(${column}, '%Y-%m-%d %H:00')`
                : `DATE_FORMAT(${column}, '%Y-%m-%d')`;

        const [
            totalUsers,
            totalPodcasts,
            totalComments,
            totalLikes,
            totalLogins,
            totalSessions,
            watchSumRow,
            avgDurationRow,
            uniqueVisitorsRow,
            loginsTodayRow,
            sessionsTodayRow,
            periodSessionsRow,
            periodLoginsRow,
            periodViewsRow,
            periodWatchRow,
            periodAvgDurationRow,
            periodUniqueVisitorsRow,
        ] = await Promise.all([
            this.userRepository.count(),
            this.podcastRepository.count({
                where: { status: PodcastStatus.PUBLISHED },
            }),
            this.commentRepository.count(),
            this.likeRepository.count(),
            this.eventRepository.count({ where: { eventType: 'login' } }),
            this.sessionRepository.count(),
            this.watchRepository
                .createQueryBuilder('w')
                .select('COALESCE(SUM(w.watchSeconds), 0)', 'total')
                .getRawOne<SumRow>(),
            this.sessionRepository
                .createQueryBuilder('s')
                .select('COALESCE(AVG(s.durationSeconds), 0)', 'avg')
                .getRawOne<AvgRow>(),
            this.sessionRepository
                .createQueryBuilder('s')
                .select('COUNT(DISTINCT s.sessionId)', 'count')
                .getRawOne<CountRow>(),
            this.eventRepository
                .createQueryBuilder('e')
                .select('COUNT(*)', 'count')
                .where("e.eventType = 'login'")
                .andWhere('e.occurredAt >= CURDATE()')
                .getRawOne<CountRow>(),
            this.sessionRepository
                .createQueryBuilder('s')
                .select('COUNT(*)', 'count')
                .where('s.startedAt >= CURDATE()')
                .getRawOne<CountRow>(),
            this.dailyRepository
                .createQueryBuilder('d')
                .select('COALESCE(SUM(d.sessions), 0)', 'total')
                .where(`d.date >= ${rangeStart}`)
                .getRawOne<SumRow>(),
            this.dailyRepository
                .createQueryBuilder('d')
                .select('COALESCE(SUM(d.logins), 0)', 'total')
                .where(`d.date >= ${rangeStart}`)
                .getRawOne<SumRow>(),
            this.dailyRepository
                .createQueryBuilder('d')
                .select('COALESCE(SUM(d.views), 0)', 'total')
                .where(`d.date >= ${rangeStart}`)
                .getRawOne<SumRow>(),
            this.dailyRepository
                .createQueryBuilder('d')
                .select('COALESCE(SUM(d.watchSeconds), 0)', 'total')
                .where(`d.date >= ${rangeStart}`)
                .getRawOne<SumRow>(),
            this.sessionRepository
                .createQueryBuilder('s')
                .select('COALESCE(AVG(s.durationSeconds), 0)', 'avg')
                .where(`s.startedAt >= ${rangeStart}`)
                .getRawOne<AvgRow>(),
            this.sessionRepository
                .createQueryBuilder('s')
                .select('COUNT(DISTINCT s.sessionId)', 'count')
                .where(`s.startedAt >= ${rangeStart}`)
                .getRawOne<CountRow>(),
        ]);

        const [
            loginsTrend,
            sessionsTrend,
            topPodcasts,
            recentLogins,
            recentComments,
        ] = await Promise.all([
            this.eventRepository
                .createQueryBuilder('e')
                .select(bucket('e.occurredAt'), 'bucket')
                .addSelect('COUNT(*)', 'count')
                .where("e.eventType = 'login'")
                .andWhere(`e.occurredAt >= ${rangeStart}`)
                .groupBy('bucket')
                .orderBy('bucket', 'ASC')
                .getRawMany<TrendRow>(),
            this.sessionRepository
                .createQueryBuilder('s')
                .select(bucket('s.startedAt'), 'bucket')
                .addSelect('COUNT(*)', 'count')
                .addSelect(
                    'COALESCE(AVG(s.durationSeconds), 0)',
                    'avgDurationSeconds',
                )
                .where(`s.startedAt >= ${rangeStart}`)
                .groupBy('bucket')
                .orderBy('bucket', 'ASC')
                .getRawMany<TrendRow>(),
            this.watchRepository
                .createQueryBuilder('w')
                .select('w.podcastId', 'podcastId')
                .addSelect('COUNT(*)', 'views')
                .addSelect('COALESCE(SUM(w.watchSeconds), 0)', 'watchSeconds')
                .addSelect('COUNT(DISTINCT w.sessionId)', 'viewers')
                .groupBy('w.podcastId')
                .orderBy('views', 'DESC')
                .limit(10)
                .getRawMany<TopWatchRow>(),
            this.eventRepository
                .createQueryBuilder('e')
                .where("e.eventType = 'login'")
                .orderBy('e.createdAt', 'DESC')
                .take(20)
                .getMany(),
            this.commentRepository
                .createQueryBuilder('comment')
                .leftJoinAndSelect('comment.user', 'user')
                .leftJoinAndSelect('comment.podcast', 'podcast')
                .select([
                    'comment.id',
                    'comment.content',
                    'comment.createdAt',
                    'user.id',
                    'user.name',
                    'user.email',
                    'podcast.id',
                    'podcast.title',
                    'podcast.slug',
                ])
                .orderBy('comment.createdAt', 'DESC')
                .take(20)
                .getMany(),
        ]);

        const topPodcastsData = await this.decorateTopPodcasts(topPodcasts);

        const loginUserIds = recentLogins
            .map((event) => Number(event.userId))
            .filter((id) => Number.isFinite(id) && id > 0);
        const loginUsers = loginUserIds.length
            ? await this.userRepository.findBy({ id: In(loginUserIds) })
            : [];
        const loginUserById = new Map(
            loginUsers.map((user) => [Number(user.id), user]),
        );

        return {
            message: 'analytics fetched successfully',
            data: {
                range,
                granularity,
                summary: {
                    totalUsers,
                    totalPodcasts,
                    totalComments,
                    totalLikes,
                    totalLogins,
                    totalSessions,
                    uniqueVisitors: Number(uniqueVisitorsRow?.count ?? 0),
                    totalWatchSeconds: Number(watchSumRow?.total ?? 0),
                    avgSessionDurationSeconds: Math.round(
                        Number(avgDurationRow?.avg ?? 0),
                    ),
                    loginsToday: Number(loginsTodayRow?.count ?? 0),
                    sessionsToday: Number(sessionsTodayRow?.count ?? 0),
                },
                periodSummary: {
                    sessions: Number(periodSessionsRow?.total ?? 0),
                    logins: Number(periodLoginsRow?.total ?? 0),
                    views: Number(periodViewsRow?.total ?? 0),
                    watchSeconds: Number(periodWatchRow?.total ?? 0),
                    avgDurationSeconds: Math.round(
                        Number(periodAvgDurationRow?.avg ?? 0),
                    ),
                    uniqueVisitors: Number(
                        periodUniqueVisitorsRow?.count ?? 0,
                    ),
                },
                loginsTrend: loginsTrend.map((row) => ({
                    date: row.bucket,
                    count: Number(row.count),
                })),
                sessionsTrend: sessionsTrend.map((row) => ({
                    date: row.bucket,
                    count: Number(row.count),
                    avgDurationSeconds: Math.round(
                        Number(row.avgDurationSeconds ?? 0),
                    ),
                })),
                topPodcasts: topPodcastsData,
                recentLogins: recentLogins.map((event) => {
                    const user = event.userId
                        ? loginUserById.get(Number(event.userId))
                        : undefined;
                    const meta = event.meta as { email?: string } | null;

                    return {
                        id: event.id,
                        email: user?.email ?? meta?.email ?? null,
                        name: user?.name ?? null,
                        createdAt: event.createdAt,
                    };
                }),
                recentComments: recentComments.map((comment) => ({
                    id: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    user: {
                        name: comment.user?.name ?? null,
                        email: comment.user?.email ?? null,
                    },
                    podcast: {
                        title: comment.podcast?.title ?? null,
                        slug: comment.podcast?.slug ?? null,
                    },
                })),
            },
        };
    }

    private async decorateTopPodcasts(
        rows: TopWatchRow[],
    ): Promise<
        Array<{
            podcast: {
                id: number;
                title: string;
                slug: string;
                coverImageUrl: string | null;
            };
            views: number;
            watchSeconds: number;
            viewers: number;
            likesCount: number;
            commentsCount: number;
        }>
    > {
        if (rows.length === 0) {
            return [];
        }

        const podcastIds = rows.map((row) => Number(row.podcastId));
        const podcasts = await this.podcastRepository.findBy({
            id: In(podcastIds),
        });
        const podcastById = new Map(
            podcasts.map((podcast) => [Number(podcast.id), podcast]),
        );

        const [likesRows, commentsRows] = await Promise.all([
            this.likeRepository
                .createQueryBuilder('like')
                .select('like.podcastId', 'podcastId')
                .addSelect('COUNT(*)', 'count')
                .where('like.podcastId IN (:...podcastIds)', { podcastIds })
                .groupBy('like.podcastId')
                .getRawMany<PodcastCountRow>(),
            this.commentRepository
                .createQueryBuilder('comment')
                .select('comment.podcastId', 'podcastId')
                .addSelect('COUNT(*)', 'count')
                .where('comment.podcastId IN (:...podcastIds)', {
                    podcastIds,
                })
                .groupBy('comment.podcastId')
                .getRawMany<PodcastCountRow>(),
        ]);

        const likesByPodcast = new Map<number, number>(
            likesRows.map((row) => [
                Number(row.podcastId),
                Number(row.count),
            ]),
        );
        const commentsByPodcast = new Map<number, number>(
            commentsRows.map((row) => [
                Number(row.podcastId),
                Number(row.count),
            ]),
        );

        return rows.map((row) => {
            const podcast = podcastById.get(Number(row.podcastId));

            return {
                podcast: {
                    id: Number(row.podcastId),
                    title: podcast?.title ?? 'پادکست حذفشده',
                    slug: podcast?.slug ?? '',
                    coverImageUrl: podcast?.coverImageUrl ?? null,
                },
                views: Number(row.views),
                watchSeconds: Number(row.watchSeconds),
                viewers: Number(row.viewers),
                likesCount: likesByPodcast.get(Number(row.podcastId)) ?? 0,
                commentsCount:
                    commentsByPodcast.get(Number(row.podcastId)) ?? 0,
            };
        });
    }

    /**
     * Upserts today's rollup row (server-local date) so per-day aggregates are
     * persisted durably and reusable later without re-querying raw events.
     */
    private async incrementDaily(fields: {
        sessions?: number;
        logins?: number;
        views?: number;
        watchSeconds?: number;
    }): Promise<void> {
        const columns = (
            ['sessions', 'logins', 'views', 'watchSeconds'] as const
        ).filter((column) => fields[column] !== undefined);

        if (columns.length === 0) {
            return;
        }

        const values = columns.map((column) => fields[column] ?? 0);
        const placeholders = values.map(() => '?').join(', ');
        const updates = columns
            .map(
                (column) =>
                    `\`${column}\` = \`${column}\` + VALUES(\`${column}\`)`,
            )
            .join(', ');

        await this.dailyRepository.manager.query(
            `INSERT INTO analytics_daily (\`date\`, \`${columns.join('`, `')}\`)
             VALUES (CURDATE(), ${placeholders})
             ON DUPLICATE KEY UPDATE ${updates}`,
            values,
        );
    }
}
