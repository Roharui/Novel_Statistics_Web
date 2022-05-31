import { IsNumber } from 'class-validator';
import { NovelDto } from './novel.dto';

export class AnalyzeNovelDto extends NovelDto{

  @IsNumber()
  view_per_good: number;
  @IsNumber()
  view_per_book: number;
  
  @IsNumber()
  view_per_good_average: number;
  @IsNumber()
  view_per_book_average: number;
}
