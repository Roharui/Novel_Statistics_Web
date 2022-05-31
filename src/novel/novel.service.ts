import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NovelEntity } from 'src/entity/novels.entity';
import { Repository } from 'typeorm';
import { CreateNovelDto } from './dto/novel-create.dto';
import { Novel } from './interfaces/novel.interface';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelRepository: Repository<NovelEntity>,
  ) {}

  create(novel: CreateNovelDto): void {
    this.novelRepository.save(novel);
  }

  async findAll(): Promise<Novel[]> {
    return await this.novelRepository.find();
  }

  async analyze(id: number): Promise<AnalyzeNovelDto> {
    const novel = await this.novelRepository.findOne({ where: { id } });

    const {
      view: total_view,
      good: total_good,
      book: total_book,
    } = await this.novelRepository
      .createQueryBuilder('novel')
      .select('SUM(novel.view)', 'view')
      .addSelect('SUM(novel.good)', 'good')
      .addSelect('SUM(novel.book)', 'book')
      .getRawOne();

    const view_per_good_average = total_view / total_good;
    const view_per_book_average = total_view / total_book;

    return {
      ...novel,
      view_per_good: novel.view / novel.good,
      view_per_book: novel.view / novel.book,

      view_per_good_average,
      view_per_book_average,
    };
  }
}
