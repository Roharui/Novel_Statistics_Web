import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovelEntity } from 'src/entity/novels.entity';
import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';

@Module({
  imports: [TypeOrmModule.forFeature([NovelEntity])],
  controllers: [NovelController],
  providers: [NovelService],
})
export class NovelModule {}
