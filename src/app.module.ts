import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { parse } from 'pg-connection-string';
import { NovelInfoEntity } from './entity/novel-info.entity';
import { NovelEntity } from './entity/novels.entity';
import { NovelModule } from './novel/novel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', '.env.production'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: parse(process.env.DATABASE_URL).host,
      port: parseInt(parse(process.env.DATABASE_URL).port),
      username: parse(process.env.DATABASE_URL).user,
      password: parse(process.env.DATABASE_URL).password,
      database: parse(process.env.DATABASE_URL).database,
      synchronize: true,
      logging: true,
      entities: [NovelEntity, NovelInfoEntity],
    }),
    NovelModule,
  ],
})
export class AppModule {}
