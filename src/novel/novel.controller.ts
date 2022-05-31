import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NovelDto } from './dto/novel.dto';
import { CreateNovelDto } from './dto/novel-create.dto';
import { Novel } from './interfaces/novel.interface';
import { NovelService } from './novel.service';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';

@Controller('n')
@UseInterceptors(ClassSerializerInterceptor)
export class NovelController {
  constructor(private novelService: NovelService) {}

  @Get('all')
  async findAll(): Promise<NovelDto[]> {
    const novels = await this.novelService.findAll();
    return novels.map((x) => new NovelDto(x));
  }

  @Post()
  async create(@Body() novel: CreateNovelDto): Promise<Novel> {
    this.novelService.create(novel);
    return novel;
  }

  @Get()
  async analyze(@Query('id') id: number): Promise<AnalyzeNovelDto> {
    return new AnalyzeNovelDto(await this.novelService.analyze(id));
  }
}
