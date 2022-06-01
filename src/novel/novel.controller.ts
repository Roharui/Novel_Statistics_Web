import {
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
  async analyze(@Query('id') id: number): Promise<AnalyzeNovelDto> {
    return new AnalyzeNovelDto(await this.novelService.analyze(id));
  }
}
