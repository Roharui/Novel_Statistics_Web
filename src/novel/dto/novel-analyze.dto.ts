import { Type } from 'class-transformer';
import { NovelStaticDto } from './novel-statics.dto';
import { NovelDto } from './novel.dto';

export class AnalyzeNovelDto {
  @Type(() => NovelDto)
  novel: NovelDto;

  // ===

  @Type(() => NovelStaticDto)
  reader_prefer?: NovelStaticDto;

  @Type(() => NovelStaticDto)
  view_avg?: NovelStaticDto;

  @Type(() => NovelStaticDto)
  reading_rate?: NovelStaticDto;

  @Type(() => NovelStaticDto)
  upload_rate?: NovelStaticDto;

  constructor(partial: Partial<AnalyzeNovelDto>) {
    Object.assign(this, partial);
  }
}
