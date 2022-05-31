import { IsEnum, IsNumber, IsString, IsUrl } from 'class-validator';
import { PlatformType } from 'src/entity/novels.entity';

export class CreateNovelDto {
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
}
