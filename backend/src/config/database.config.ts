import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

export class DatabaseConfig implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions {
        const isProduction = process.env.NODE_ENV === 'production';

        return {
            type: process.env.TYPE_DB as 'mysql',
            host: process.env.HOST_DB,
            port: Number(process.env.PORT_DB),
            username: process.env.USERNAME_DB,
            password: process.env.PASSWORD_DB,
            database: process.env.DATABASE_DB,
            autoLoadEntities: process.env.AUTOLOADENTITIES === 'true',
            synchronize:
                !isProduction && process.env.SYNCHRONIZE === 'true',
            migrations: [
                join(
                    __dirname,
                    '../database/migrations/*{.ts,.js}',
                ),
            ],
            migrationsTableName: 'migrations',
            migrationsRun: false,
        };
    }
}
