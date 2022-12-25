import { Type } from 'class-transformer';
import { NovelEpisodeDto } from './novel-episode.dto';
import { NovelInfoDto } from './novel-info.dto';
import { NovelStatisticsDto } from './novel-statistics.dto';
import { NovelDto } from './novel.dto';

export class AnalyzeNovelDto {
  @Type(() => NovelDto)
  novel: NovelDto;

  // ===

  @Type(() => NovelStatisticsDto)
  reader_prefer: NovelStatisticsDto;

  @Type(() => NovelStatisticsDto)
  view_avg: NovelStatisticsDto;

  @Type(() => NovelStatisticsDto)
  reading_rate: NovelStatisticsDto;

  @Type(() => NovelStatisticsDto)
  upload_rate: NovelStatisticsDto;

  // ===

  @Type(() => NovelInfoDto)
  growth: NovelInfoDto;

  @Type(() => NovelEpisodeDto)
  episode: NovelEpisodeDto;

  constructor(partial: Partial<AnalyzeNovelDto>) {
    Object.assign(this, partial);
  }
}
