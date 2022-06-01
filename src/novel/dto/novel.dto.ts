import { Exclude } from 'class-transformer';
import { PlatformType } from 'src/entity/novels.entity';
import { IsEnum, IsString, IsUrl } from 'class-validator';

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

  constructor(partial: Partial<NovelDto>) {
    Object.assign(this, partial);
  }
}
