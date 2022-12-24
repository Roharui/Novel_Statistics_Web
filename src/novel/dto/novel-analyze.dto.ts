import { Type } from 'class-transformer';
import { NovelStatisticsDto } from './novel-statistics.dto';
import { NovelDto } from './novel.dto';

export class AnalyzeNovelDto {
  @Type(() => NovelDto)
  novel: NovelDto;

  // ===

  @Type(() => NovelStatisticsDto)
  reader_prefer?: NovelStatisticsDto;

  @Type(() => NovelStatisticsDto)
  view_avg?: NovelStatisticsDto;

  @Type(() => NovelStatisticsDto)
  reading_rate?: NovelStatisticsDto;

  @Type(() => NovelStatisticsDto)
  upload_rate?: NovelStatisticsDto;

  constructor(partial: Partial<AnalyzeNovelDto>) {
    Object.assign(this, partial);
  }
}
