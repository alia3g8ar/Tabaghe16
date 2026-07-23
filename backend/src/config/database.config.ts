import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

export class DatabaseConfig implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): TypeOrmModuleOptions {
        console.log();
        return {
            type: process.env.TYPE_DB as 'mysql',
            host: process.env.HOST_DB,
            port: Number(process.env.PORT_DB),
            username: process.env.USERNAME_DB,
            password: process.env.PASSWORD_DB,
            database: process.env.DATABASE_DB,
            autoLoadEntities: process.env.AUTOLOADENTITIES === 'true',
            synchronize: process.env.SYNCHRONIZE === 'true',
        };
    }
}
