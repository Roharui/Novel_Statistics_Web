import { Exclude } from 'class-transformer';
import { IsDate, IsNumber } from 'class-validator';

export class NovelInfoDto {
  @Exclude()
  id: number;

  @IsNumber()
  view: number;

  @IsNumber()
  good: number;

  @IsNumber()
  book: number;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  constructor(partial: Partial<NovelInfoDto>) {
    Object.assign(this, partial);
  }
}
