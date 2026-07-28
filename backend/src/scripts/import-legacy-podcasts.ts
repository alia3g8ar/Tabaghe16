import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from 'src/modules/app/app.module';
import { Podcast } from 'src/modules/podcast/entities/podcast.entity';
import { PodcastStatus } from 'src/modules/podcast/enums/podcast-status.enum';
import {
    LegacyPodcast,
    legacyPodcasts,
} from './data/legacy-podcasts';

const LEGACY_PUBLISHED_AT = new Date('2024-01-01T00:00:00.000Z');

type ImportCounts = {
    created: number;
    updated: number;
    skipped: number;
    failed: number;
};

function durationToSeconds(duration: string): number {
    const match = /^(\d{2}):([0-5]\d):([0-5]\d)$/.exec(duration);

    if (!match) {
        throw new Error('invalid duration format');
    }

    const [, hours, minutes, seconds] = match;

    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function mapLegacyPodcast(record: LegacyPodcast): Partial<Podcast> {
    return {
        title: record.title,
        slug: `legacy-episode-${record.id}`,
        description: null,
        episodeNumber: record.id,
        durationSeconds: durationToSeconds(record.duration),
        audioUrl: null,
        videoUrl: record.youtubeUrl,
        coverImageUrl: record.thumbnail,
        guest: record.guest,
        status: PodcastStatus.PUBLISHED,
        publishedAt: LEGACY_PUBLISHED_AT,
    };
}

function isUnchanged(
    existing: Podcast,
    mapped: Partial<Podcast>,
): boolean {
    return (
        existing.title === mapped.title &&
        existing.description === mapped.description &&
        existing.episodeNumber === mapped.episodeNumber &&
        existing.durationSeconds === mapped.durationSeconds &&
        existing.audioUrl === mapped.audioUrl &&
        existing.videoUrl === mapped.videoUrl &&
        existing.coverImageUrl === mapped.coverImageUrl &&
        existing.guest === mapped.guest &&
        existing.status === mapped.status &&
        existing.publishedAt?.getTime() ===
            mapped.publishedAt?.getTime()
    );
}

async function importLegacyPodcasts(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    });
    const counts: ImportCounts = {
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
    };

    try {
        const podcastRepository = app.get<Repository<Podcast>>(
            getRepositoryToken(Podcast),
        );

        for (const legacyPodcast of legacyPodcasts) {
            const slug = `legacy-episode-${legacyPodcast.id}`;

            try {
                const mapped = mapLegacyPodcast(legacyPodcast);
                const existing = await podcastRepository.findOneBy({ slug });

                if (!existing) {
                    await podcastRepository.save(
                        podcastRepository.create(mapped),
                    );
                    counts.created += 1;
                    continue;
                }

                if (isUnchanged(existing, mapped)) {
                    counts.skipped += 1;
                    continue;
                }

                podcastRepository.merge(existing, mapped);
                await podcastRepository.save(existing);
                counts.updated += 1;
            } catch (error) {
                counts.failed += 1;
                const reason =
                    error instanceof Error
                        ? error.message
                        : 'unknown import error';
                console.error(`Failed to import ${slug}: ${reason}`);
            }
        }

        console.log(
            `Legacy podcast import complete: created=${counts.created}, updated=${counts.updated}, skipped=${counts.skipped}, failed=${counts.failed}`,
        );

        if (counts.failed > 0) {
            process.exitCode = 1;
        }
    } finally {
        await app.close();
    }
}

void importLegacyPodcasts().catch(() => {
    console.error('Legacy podcast import could not start');
    process.exitCode = 1;
});
