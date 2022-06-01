import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { NovelInfoDto } from './novel-create.dto';
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
  view_per_good_average: number;
  @IsNumber()
  view_per_book_average: number;
}
