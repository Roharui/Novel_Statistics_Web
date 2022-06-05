import { IsNumber, IsString } from 'class-validator';
import { CrawlingResponse } from '../interfaces/response.interface';

export class SearchResponseDto implements CrawlingResponse {
  @IsNumber()
  code: number;

  @IsString()
  err: string;
}
