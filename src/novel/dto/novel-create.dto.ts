import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { NovelInfoDto } from './novel-info.dto';
import { NovelDto } from './novel.dto';

export class CreateNovelDto extends NovelDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NovelInfoDto)
  info: NovelInfoDto[];
}
