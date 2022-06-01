import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelInfoEntity } from './entity/novel-info.entity';
import { NovelEntity } from './entity/novels.entity';
import { NovelModule } from './novel/novel.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      entities: [NovelEntity, NovelInfoEntity],
    }),
    NovelModule,
  ],
})
export class AppModule {}
