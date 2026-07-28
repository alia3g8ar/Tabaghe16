import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PayloadGuard } from '../../common/guard/payload.guard';
import { RoleGuard } from '../../common/guard/role.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseConfig } from 'src/config/database.config';
import { UsersModule } from '../users/users.module';
import { PodcastModule } from '../podcast/podcast.module';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useClass: DatabaseConfig,
        }),
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        AuthModule,
        UsersModule,
        PodcastModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: PayloadGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
    ],
})
export class AppModule {}
