import {
  BadRequestException,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NovelService } from './novel.service';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';

@Controller('n')
@UseInterceptors(ClassSerializerInterceptor)
export class NovelController {
  constructor(private novelService: NovelService) {}

  @Get()
  async analyze(@Query('url') url: string) {
    if (!url) return new BadRequestException();
    return new AnalyzeNovelDto(await this.novelService.analyze(url));
  }
}
