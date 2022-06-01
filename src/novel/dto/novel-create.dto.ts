import { Exclude, Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { NovelDto } from './novel.dto';

export class CreateNovelDto extends NovelDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NovelInfoDto)
  info: NovelInfoDto[];
}
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
