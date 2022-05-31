import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NovelEntity } from 'src/entity/novels.entity';
import { Repository } from 'typeorm';
import { CreateNovelDto } from './dto/novel-create.dto';
import { Novel } from './interfaces/novel.interface';

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
}
