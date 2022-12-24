import { IsNumber } from 'class-validator';
import { Percent, Round } from 'src/utils';

export class NovelStaticDto {
  @Round()
  @IsNumber()
  cur: number;

  @Percent()
  @IsNumber()
  percentage: number;

  @Round()
  @IsNumber()
  avg: number;

  @Round()
  @IsNumber()
  content_avg: number;

  constructor(partial: Partial<NovelStaticDto>) {
    Object.assign(this, partial);
  }
}
