import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelEntity } from './entity/novels.entity';
import { NovelModule } from './novel/novel.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      entities: [NovelEntity],
    }),
    NovelModule,
  ],
})
export class AppModule {}
