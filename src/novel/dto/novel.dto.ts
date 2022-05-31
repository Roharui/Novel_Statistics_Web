import { Exclude } from 'class-transformer';
import { PlatformType } from 'src/entity/novels.entity';
import { IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

export class NovelDto {
  @Exclude()
  id: number;

  @IsString()
  title: string;

  @IsEnum(PlatformType)
  type: PlatformType;

  @IsUrl()
  thumbnail: string;

  @IsNumber()
  view: number;

  @IsNumber()
  good: number;

  @IsNumber()
  book: number;

  @IsUrl()
  link: string;

  constructor(partial: Partial<NovelDto>) {
    Object.assign(this, partial);
  }
}
