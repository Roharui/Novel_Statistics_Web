import { IsString } from 'class-validator';

export class NovelLinkDto {
  @IsString()
  link: string;
}
