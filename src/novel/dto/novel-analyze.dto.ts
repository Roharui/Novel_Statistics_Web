import { Transform } from 'class-transformer';
import { IsNumber, IsObject } from 'class-validator';
import { NovelInfoDto } from './novel-info.dto';
import { SearchResponseDto } from './novel-search.dto';
import { NovelDto } from './novel.dto';

export class AnalyzeNovelDto extends NovelDto {
  @Transform(({ value }) => {
    return new NovelInfoDto(value[value.length - 1]);
  })
  info: NovelInfoDto[];

  @IsNumber()
  view_per_good: number;
  @IsNumber()
  view_per_book: number;

  @IsNumber()
  total_novel_count: number;
  @IsNumber()
  type_novel_count: number;

  @IsNumber()
  view_per_novel_count: number;
  @IsNumber()
  view_per_type_novel_count: number;

  @IsNumber()
  good_per_novel_count: number;
  @IsNumber()
  good_per_type_novel_count: number;

  @IsNumber()
  view_per_good_average: number;
  @IsNumber()
  view_per_book_average: number;

  @IsNumber()
  view_per_good_platform_average: number;
  @IsNumber()
  view_per_book_platform_average: number;

  @IsObject()
  search_response: SearchResponseDto;
}
