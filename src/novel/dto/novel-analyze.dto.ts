import { Transform } from 'class-transformer';
import { IsArray, IsNumber, IsObject } from 'class-validator';
import { NovelInfoDto } from './novel-info.dto';
import { SearchResponseDto } from './novel-search.dto';
import { NovelDto } from './novel.dto';

function ToFixed() {
  return Transform(({ value }) =>
    value ? parseFloat(value.toFixed(4)) : null,
  );
}

export class AnalyzeNovelDto extends NovelDto {
  @IsArray()
  @Transform(({ value }) => {
    return value.map((x) => new NovelInfoDto(x));
  })
  info: NovelInfoDto[];

  @IsObject()
  @Transform(({ value }) => {
    return new NovelInfoDto(value);
  })
  cur_info: NovelInfoDto;

  // ===

  @ToFixed()
  @IsNumber()
  growth_view: number;
  @ToFixed()
  @IsNumber()
  growth_good: number;

  @ToFixed()
  @IsNumber()
  latest_growth_view: number;
  @ToFixed()
  @IsNumber()
  latest_growth_good: number;

  @ToFixed()
  @IsNumber()
  serial_rate: number;
  @ToFixed()
  @IsNumber()
  latest_serial_rate: number;

  // ===

  @ToFixed()
  @IsNumber()
  view_per_good: number;
  @ToFixed()
  @IsNumber()
  view_per_book: number;

  @ToFixed()
  @IsNumber()
  total_novel_count: number;
  @ToFixed()
  @IsNumber()
  type_novel_count: number;

  @ToFixed()
  @IsNumber()
  view_per_novel_count: number;
  @ToFixed()
  @IsNumber()
  view_per_type_novel_count: number;

  @ToFixed()
  @IsNumber()
  good_per_novel_count: number;
  @ToFixed()
  @IsNumber()
  good_per_type_novel_count: number;

  @ToFixed()
  @IsNumber()
  view_per_good_average: number;
  @ToFixed()
  @IsNumber()
  view_per_book_average: number;

  @ToFixed()
  @IsNumber()
  view_per_good_platform_average: number;
  @ToFixed()
  @IsNumber()
  view_per_book_platform_average: number;

  @IsObject()
  search_response: SearchResponseDto;
}
