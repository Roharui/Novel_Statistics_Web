import { Exclude } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class NovelEpisodeDto {
  @Exclude()
  id: number;

  @Exclude()
  novel_id: number;

  @Exclude()
  created_at: number;

  @IsString()
  word_size: string;

  @IsString()
  title: string;

  @IsNumber()
  idx: number;

  @IsNumber()
  view: number;

  @IsNumber()
  good: number;

  @IsNumber()
  comment: number;

  @IsString()
  date: string;

  constructor(partial: Partial<NovelEpisodeDto>) {
    Object.assign(this, partial);
  }
}
