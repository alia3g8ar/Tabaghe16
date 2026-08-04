import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Not, QueryFailedError, Repository } from 'typeorm';
import { AdminPodcastQueryDto } from './dto/admin-podcast-query.dto';
import { CreatePodcastDto } from './dto/create-podcast.dto';
import { PodcastPaginationQueryDto } from './dto/podcast-pagination-query.dto';
import { UpdatePodcastDto } from './dto/update-podcast.dto';
import { Podcast } from './entities/podcast.entity';
import { PodcastStatus } from './enums/podcast-status.enum';

@Injectable()
export class PodcastService {
    constructor(
        @InjectRepository(Podcast)
        private readonly podcastRepository: Repository<Podcast>,
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
        const podcast = await this.podcastRepository.findOneBy({
            slug,
            status: PodcastStatus.PUBLISHED,
        });

        if (!podcast) {
            throw new NotFoundException('podcast not found');
        }

        return {
            message: 'podcast fetched successfully',
            data: podcast,
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
