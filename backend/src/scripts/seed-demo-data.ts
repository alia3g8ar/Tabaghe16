import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from 'src/modules/app/app.module';
import { User } from 'src/modules/auth/entities/user.entity';
import { Podcast } from 'src/modules/podcast/entities/podcast.entity';
import { demoPodcasts } from './data/demo-podcasts';
import { demoUsers } from './data/demo-users';

type SeedCounts = {
    podcastsCreated: number;
    podcastsSkipped: number;
    usersCreated: number;
    usersSkipped: number;
};

async function seedDemoData(): Promise<void> {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: false,
    });
    const counts: SeedCounts = {
        podcastsCreated: 0,
        podcastsSkipped: 0,
        usersCreated: 0,
        usersSkipped: 0,
    };

    try {
        const podcastRepository = app.get<Repository<Podcast>>(
            getRepositoryToken(Podcast),
        );
        const userRepository = app.get<Repository<User>>(
            getRepositoryToken(User),
        );

        for (const demoPodcast of demoPodcasts) {
            const existing = await podcastRepository.findOneBy({
                slug: demoPodcast.slug,
            });

            if (existing) {
                counts.podcastsSkipped += 1;
                continue;
            }

            await podcastRepository.save(
                podcastRepository.create({
                    ...demoPodcast,
                    publishedAt: new Date(),
                }),
            );
            counts.podcastsCreated += 1;
        }

        for (const demoUser of demoUsers) {
            const existing = await userRepository.findOneBy({
                email: demoUser.email,
            });

            if (existing) {
                counts.usersSkipped += 1;
                continue;
            }

            await userRepository.save(userRepository.create(demoUser));
            counts.usersCreated += 1;
        }

        console.log(
            `Demo data seed complete: podcasts created=${counts.podcastsCreated}, skipped=${counts.podcastsSkipped}; ` +
                `users created=${counts.usersCreated}, skipped=${counts.usersSkipped}`,
        );
    } finally {
        await app.close();
    }
}

void seedDemoData().catch((error: unknown) => {
    const message =
        error instanceof Error ? error.message : 'unknown seed error';
    console.error(`Demo data seed failed: ${message}`);
    process.exitCode = 1;
});
