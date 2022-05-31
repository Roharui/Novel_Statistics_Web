import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateNovelDto } from './dto/novel-create.dto';
import { Novel } from './interfaces/novel.interface';
import { NovelService } from './novel.service';

@Controller('n')
export class NovelController {
  constructor(private novelService: NovelService) {}

  @Get()
  async findAll(): Promise<Novel[]> {
    return await this.novelService.findAll();
  }

  @Post()
  async create(@Body() novel: CreateNovelDto): Promise<Novel> {
    this.novelService.create(novel);
    return novel;
  }
}
