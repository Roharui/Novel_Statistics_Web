import { PlatformType } from 'src/entity/novels.entity';

export interface Novel {
  title: string;
  type: PlatformType;
  link: string;
  thumbnail: string;
  view: number;
  good: number;
  book: number;
}
