import { Exclude } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class NovelInfoDto {
  @Exclude()
  id: number;

  @Exclude()
  novel_id: Date;

  @IsDate()
  created_at: Date;

  @IsNumber()
  view: number;

  @IsNumber()
  good: number;

  @IsNumber()
  book: number;

  constructor(partial: Partial<NovelInfoDto>) {
    Object.assign(this, partial);
  }
}
