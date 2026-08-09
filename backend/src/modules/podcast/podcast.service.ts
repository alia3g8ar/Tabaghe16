import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, QueryFailedError, Repository } from 'typeorm';
import { roleEnum } from 'src/common/enums/role.enum';
import { User } from 'src/modules/auth/entities/user.entity';
import { AdminPodcastQueryDto } from './dto/admin-podcast-query.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { PodcastPaginationQueryDto } from './dto/podcast-pagination-query.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { Podcast } from './entities/podcast.entity';
import { PodcastComment } from './entities/podcast-comment.entity';
import { PodcastLike } from './entities/podcast-like.entity';
import { SavedPodcast } from './entities/saved-podcast.entity';
import { PodcastStatus } from './enums/podcast-status.enum';

type Actor = {
    sub: number | string;
    role: roleEnum;
};

type PodcastCountRow = {
    podcastId: number;
    count: string;
};

@Injectable()
export class PodcastService {
    constructor(
        @InjectRepository(Podcast)
        private readonly podcastRepository: Repository<Podcast>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(PodcastComment)
        private readonly commentRepository: Repository<PodcastComment>,
        @InjectRepository(PodcastLike)
        private readonly likeRepository: Repository<PodcastLike>,
        @InjectRepository(SavedPodcast)
        private readonly savedRepository: Repository<SavedPodcast>,
    ) {}

    async findPublished(query: PodcastPaginationQueryDto) {
        const { page, limit } = query;
        const [podcasts, total] = await this.podcastRepository.findAndCount({
            where: { status: PodcastStatus.PUBLISHED },
            order: {
                publishedAt: 'DESC',
                createdAt: 'DESC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            message: 'podcasts fetched successfully',
            data: podcasts,
            meta: this.paginationMeta(page, limit, total),
        };
    }

    async findPublishedBySlug(slug: string) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const [likesCount, commentsCount] = await Promise.all([
            this.likeRepository.count({
                where: { podcastId: podcast.id },
            }),
            this.commentRepository.count({
                where: { podcastId: podcast.id },
            }),
        ]);

        return {
            message: 'podcast fetched successfully',
            data: {
                ...podcast,
                likesCount,
                commentsCount,
            },
        };
    }

    async findAllForAdmin(query: AdminPodcastQueryDto) {
        const { page, limit, status } = query;
        const search = query.search?.trim();
        const podcastsQuery = this.podcastRepository
            .createQueryBuilder('podcast')
            .orderBy('podcast.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (search) {
            podcastsQuery.andWhere(
                new Brackets((builder) => {
                    builder
                        .where('podcast.title LIKE :search', {
                            search: `%${search}%`,
                        })
                        .orWhere('podcast.slug LIKE :search', {
                            search: `%${search}%`,
                        })
                        .orWhere('podcast.description LIKE :search', {
                            search: `%${search}%`,
                        });
                }),
            );
        }

        if (status) {
            podcastsQuery.andWhere('podcast.status = :status', { status });
        }

        const [podcasts, total] = await podcastsQuery.getManyAndCount();

        return {
            message: 'podcasts fetched successfully',
            data: podcasts,
            meta: this.paginationMeta(page, limit, total),
        };
    }

    async findOneForAdmin(id: number) {
        const podcast = await this.findById(id);

        return {
            message: 'podcast fetched successfully',
            data: podcast,
        };
    }

    async create(dto: CreatePodcastDto) {
        this.assertHasMedia(dto.audioUrl, dto.videoUrl);
        await this.assertSlugAvailable(dto.slug);
        const status = dto.status ?? PodcastStatus.DRAFT;
        const podcast = this.podcastRepository.create({
            ...dto,
            status,
            publishedAt: status === PodcastStatus.PUBLISHED ? new Date() : null,
        });

        try {
            const savedPodcast = await this.podcastRepository.save(podcast);

            return {
                message: 'podcast created successfully',
                data: savedPodcast,
            };
        } catch (error) {
            this.rethrowDuplicateSlug(error);
            throw error;
        }
    }

    async update(id: number, dto: UpdatePodcastDto) {
        const podcast = await this.findById(id);

        if (dto.slug && dto.slug !== podcast.slug) {
            await this.assertSlugAvailable(dto.slug, id);
        }

        Object.assign(podcast, dto);
        this.assertHasMedia(podcast.audioUrl, podcast.videoUrl);

        if (
            podcast.status === PodcastStatus.PUBLISHED &&
            !podcast.publishedAt
        ) {
            podcast.publishedAt = new Date();
        }

        try {
            const updatedPodcast = await this.podcastRepository.save(podcast);

            return {
                message: 'podcast updated successfully',
                data: updatedPodcast,
            };
        } catch (error) {
            this.rethrowDuplicateSlug(error);
            throw error;
        }
    }

    async remove(id: number) {
        const podcast = await this.findById(id);
        await this.podcastRepository.remove(podcast);

        return {
            message: 'podcast deleted successfully',
        };
    }

    // ---------------------------------------------------------------
    // Interactions: like / save / comments
    // ---------------------------------------------------------------

    async getUserInteractions(slug: string, userId: number | string) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const userIdNumber = Number(userId);
        const [liked, saved] = await Promise.all([
            this.likeRepository.existsBy({
                userId: userIdNumber,
                podcastId: podcast.id,
            }),
            this.savedRepository.existsBy({
                userId: userIdNumber,
                podcastId: podcast.id,
            }),
        ]);

        return {
            message: 'interactions fetched successfully',
            data: { liked, saved },
        };
    }

    async toggleLike(slug: string, userId: number | string) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const userIdNumber = Number(userId);
        const existing = await this.likeRepository.findOneBy({
            userId: userIdNumber,
            podcastId: podcast.id,
        });

        let liked: boolean;

        if (existing) {
            await this.likeRepository.remove(existing);
            liked = false;
        } else {
            await this.likeRepository.save(
                this.likeRepository.create({
                    userId: userIdNumber,
                    podcastId: podcast.id,
                }),
            );
            liked = true;
        }

        const likesCount = await this.likeRepository.count({
            where: { podcastId: podcast.id },
        });

        return {
            message: liked ? 'podcast liked' : 'podcast unliked',
            data: { liked, likesCount },
        };
    }

    async toggleSave(slug: string, userId: number | string) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const userIdNumber = Number(userId);
        const existing = await this.savedRepository.findOneBy({
            userId: userIdNumber,
            podcastId: podcast.id,
        });

        let saved: boolean;

        if (existing) {
            await this.savedRepository.remove(existing);
            saved = false;
        } else {
            await this.savedRepository.save(
                this.savedRepository.create({
                    userId: userIdNumber,
                    podcastId: podcast.id,
                }),
            );
            saved = true;
        }

        return {
            message: saved ? 'podcast saved' : 'podcast unsaved',
            data: { saved },
        };
    }

    async findSavedPodcasts(userId: number | string) {
        const userIdNumber = Number(userId);
        const savedPodcasts = await this.savedRepository.find({
            where: { userId: userIdNumber },
            relations: { podcast: true },
            order: { createdAt: 'DESC' },
            take: 100,
        });

        const podcasts = savedPodcasts
            .map((entry) => entry.podcast)
            .filter(
                (podcast): podcast is Podcast =>
                    Boolean(podcast) &&
                    podcast.status === PodcastStatus.PUBLISHED,
            );

        if (podcasts.length === 0) {
            return {
                message: 'saved podcasts fetched successfully',
                data: [],
            };
        }

        const podcastIds = podcasts.map((podcast) => podcast.id);
        const [likesCounts, commentsCounts] = await Promise.all([
            this.likeRepository
                .createQueryBuilder('like')
                .select('like.podcastId', 'podcastId')
                .addSelect('COUNT(*)', 'count')
                .where('like.podcastId IN (:...podcastIds)', {
                    podcastIds,
                })
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
            likesCounts.map((row) => [
                Number(row.podcastId),
                Number(row.count),
            ]),
        );
        const commentsByPodcast = new Map<number, number>(
            commentsCounts.map((row) => [
                Number(row.podcastId),
                Number(row.count),
            ]),
        );

        const data = podcasts.map((podcast) => ({
            ...podcast,
            likesCount: likesByPodcast.get(Number(podcast.id)) ?? 0,
            commentsCount: commentsByPodcast.get(Number(podcast.id)) ?? 0,
        }));

        return {
            message: 'saved podcasts fetched successfully',
            data,
        };
    }

    async findComments(slug: string) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const comments = await this.commentRepository
            .createQueryBuilder('comment')
            .leftJoinAndSelect('comment.user', 'user')
            .select([
                'comment.id',
                'comment.content',
                'comment.createdAt',
                'user.id',
                'user.name',
                'user.email',
                'user.avatarUrl',
            ])
            .where('comment.podcastId = :podcastId', {
                podcastId: podcast.id,
            })
            .orderBy('comment.createdAt', 'DESC')
            .take(100)
            .getMany();

        return {
            message: 'comments fetched successfully',
            data: comments.map((comment) => ({
                id: comment.id,
                content: comment.content,
                createdAt: comment.createdAt,
                user: {
                    id: comment.user?.id,
                    name: comment.user?.name ?? null,
                    email: comment.user?.email ?? '',
                    avatarUrl: comment.user?.avatarUrl ?? null,
                },
            })),
        };
    }

    async createComment(
        slug: string,
        userId: number | string,
        dto: CreateCommentDto,
    ) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const userIdNumber = Number(userId);
        const user = await this.userRepository.findOneBy({
            id: userIdNumber,
        });

        const comment = this.commentRepository.create({
            content: dto.content,
            userId: userIdNumber,
            podcastId: podcast.id,
        });
        const saved = await this.commentRepository.save(comment);

        return {
            message: 'comment created successfully',
            data: {
                id: saved.id,
                content: saved.content,
                createdAt: saved.createdAt,
                user: {
                    id: user?.id,
                    name: user?.name ?? null,
                    email: user?.email ?? '',
                    avatarUrl: user?.avatarUrl ?? null,
                },
            },
        };
    }

    async removeComment(slug: string, commentId: number, actor: Actor) {
        const podcast = await this.findPublishedEntityBySlug(slug);
        const comment = await this.commentRepository.findOneBy({
            id: commentId,
            podcastId: podcast.id,
        });

        if (!comment) {
            throw new NotFoundException('comment not found');
        }

        const isOwner = Number(comment.userId) === Number(actor.sub);
        const isModerator =
            actor.role === roleEnum.ADMIN || actor.role === roleEnum.OWNER;

        if (!isOwner && !isModerator) {
            throw new ForbiddenException('شما اجازه حذف این نظر را ندارید');
        }

        await this.commentRepository.remove(comment);

        return {
            message: 'comment deleted successfully',
        };
    }

    private async findPublishedEntityBySlug(slug: string): Promise<Podcast> {
        const podcast = await this.podcastRepository.findOneBy({
            slug,
            status: PodcastStatus.PUBLISHED,
        });

        if (!podcast) {
            throw new NotFoundException('podcast not found');
        }

        return podcast;
    }

    private async findById(id: number): Promise<Podcast> {
        const podcast = await this.podcastRepository.findOneBy({ id });

        if (!podcast) {
            throw new NotFoundException('podcast not found');
        }

        return podcast;
    }

    private async assertSlugAvailable(
        slug: string,
        excludedId?: number,
    ): Promise<void> {
        const podcast = await this.podcastRepository.findOne({
            where: {
                slug,
                ...(excludedId ? { id: Not(excludedId) } : {}),
            },
        });

        if (podcast) {
            throw new ConflictException('podcast slug already exists');
        }
    }

    private rethrowDuplicateSlug(error: unknown): void {
        if (
            error instanceof QueryFailedError &&
            (error as QueryFailedError & { driverError?: { code?: string } })
                .driverError?.code === 'ER_DUP_ENTRY'
        ) {
            throw new ConflictException('podcast slug already exists');
        }
    }

    private assertHasMedia(
        audioUrl: string | null | undefined,
        videoUrl: string | null | undefined,
    ): void {
        if (!audioUrl && !videoUrl) {
            throw new BadRequestException(
                'at least one of audioUrl or videoUrl is required',
            );
        }
    }

    private paginationMeta(page: number, limit: number, total: number) {
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
}
