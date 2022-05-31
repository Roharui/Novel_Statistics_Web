import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelModule } from './novel/novel.module';

@Module({
  imports: [TypeOrmModule.forRoot(), NovelModule],
})
export class AppModule {}
