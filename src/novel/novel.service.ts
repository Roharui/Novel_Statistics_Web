import { Injectable } from '@nestjs/common';
import { Novel } from './interfaces/novel.interface';

@Injectable()
export class NovelService {
  private readonly novel: Novel[] = [];

  create(novel: Novel) {
    this.novel.push(novel);
  }

  findAll(): Novel[] {
    return this.novel;
  }
}
