import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { NovelService } from './novel.service';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { NovelLinkDto } from './dto/novel-link.dto';

@Controller('n')
@UseInterceptors(ClassSerializerInterceptor)
export class NovelController {
  constructor(
    private novelService: NovelService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Get()
  async analyze(@Query('id') id: number): Promise<AnalyzeNovelDto> {
    return new AnalyzeNovelDto(await this.novelService.analyze(id));
  }

  @Post()
  async crawling(@Body() body: NovelLinkDto) {
    this.amqpConnection.publish('', 'novel.link', body);
  }
}
