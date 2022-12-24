import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelEpisodeEntity } from './entity/novel-episode.entity';
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
      url: process.env.DATABASE_URL,
      synchronize: false,
      logging: process.env.NODE_ENV == 'dev',
      entities: [NovelEntity, NovelInfoEntity, NovelEpisodeEntity],
    }),
    NovelModule,
  ],
})
export class AppModule {}
