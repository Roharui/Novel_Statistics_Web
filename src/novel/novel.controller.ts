import { Body, Controller, Get, Post } from '@nestjs/common';
import { Novel } from './interfaces/novel.interface';
import { NovelService } from './novel.service';

@Controller('n')
export class NovelController {
  constructor(private novelService: NovelService){}

  @Get()
  findAll(): Novel[] {
    return this.novelService.findAll();
  }
}