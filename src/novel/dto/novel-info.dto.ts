import { Exclude } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class NovelInfoDto {
  @Exclude()
  id: number;

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
