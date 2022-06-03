import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { NovelEntity } from 'src/entity/novels.entity';
import { Connection, Repository } from 'typeorm';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';
import { NovelLinkDto } from './dto/novel-link.dto';
import { CrawlingResponse } from './interfaces/response.interface';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelRepository: Repository<NovelEntity>,
    @InjectConnection()
    private readonly connection: Connection,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  async analyze(id: number): Promise<AnalyzeNovelDto> {
    const novel = await this.novelRepository.findOne({
      relations: ['info'],
      where: { id },
    });

    const {
      view: total_view,
      good: total_good,
      book: total_book,
    } = (
      await this.connection.query(`
      select sum(nn.view) as "view", sum(nn.good) as good, sum(nn.book) as book from (
      select * from "novel-info" ni2 
      where ni2.id in (select max(ni.id) from "novel-info" ni group by  ni."novelId")) nn`)
    )[0];

    const view_per_good_average = total_view / total_good;
    const view_per_book_average = total_view / total_book;

    const info = novel.info;
    const l = info.length - 1;

    return {
      ...novel,
      view_per_good: info[l].view / info[l].good,
      view_per_book: info[l].view / info[l].book,

      view_per_good_average,
      view_per_book_average,
    };
  }

  async crawling(body: NovelLinkDto): Promise<CrawlingResponse> {
    const response = await this.amqpConnection.request<CrawlingResponse>({
      exchange: '',
      routingKey: 'novel.link',
      payload: body,
      timeout: 10000,
    });
    return response;
  }
}
