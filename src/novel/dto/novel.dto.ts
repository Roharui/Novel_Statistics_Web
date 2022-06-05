import { Exclude } from 'class-transformer';
import { PlatformType } from 'src/entity/novels.entity';
import { IsBoolean, IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';

export class NovelDto {
  @Exclude()
  id: number;

  @IsString()
  title: string;

  @IsEnum(PlatformType)
  type: PlatformType;

  @IsUrl()
  thumbnail: string;

  @IsUrl()
  link: string;

  @IsBoolean()
  is_end: boolean;

  @IsBoolean()
  is_plus: boolean;

  @IsNumber()
  age_limit: number;

  @IsString()
  author: string;

  constructor(partial: Partial<NovelDto>) {
    Object.assign(this, partial);
  }
}
