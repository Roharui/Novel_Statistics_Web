import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { NovelService } from './novel.service';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';
import { NovelLinkDto } from './dto/novel-link.dto';

@Controller('n')
@UseInterceptors(ClassSerializerInterceptor)
export class NovelController {
  constructor(private novelService: NovelService) {}

  @Post()
  async analyze(@Body() body: NovelLinkDto) {
    return new AnalyzeNovelDto(await this.novelService.analyze(body));
  }
}
