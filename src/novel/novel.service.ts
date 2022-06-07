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

  async analyze(dto: NovelLinkDto): Promise<AnalyzeNovelDto> {
    let novel = await this.selectLink(dto.link);

    let search_response = null;

    if (novel === null) {
      search_response = (await this.crawling(dto)) || {};
      novel = await this.selectLink(dto.link);
    }

    const {
      view: total_view,
      good: total_good,
      book: total_book,
    } = (
      await this.connection.query(`
      select 
      sum(nn.view) as "view", 
      sum(nn.good) as "good", 
      sum(nn.book) as "book" from (
      select * from "novel-info" ni2 
      inner join "novel" n on n.id = ni2."novelId"
      where 
        ni2.id in (
          select max(ni.id) from "novel-info" ni group by ni."novelId"
        )
        and
        n.is_plus
      ) nn`)
    )[0];

    const {
      view: total_type_view,
      good: total_type_good,
      book: total_type_book,
    } = (
      await this.connection.query(`
      select 
      sum(nn.view) as "view", 
      sum(nn.good) as "good", 
      sum(nn.book) as "book" from (
      select * from "novel-info" ni2 
      inner join "novel" n on n.id = ni2."novelId"
      where 
        ni2.id in (
          select max(ni.id) from "novel-info" ni group by ni."novelId"
        )
        and
        n."type" = '${novel.type}'
        and
        n.is_plus
      ) nn`)
    )[0];

    const total_novel_count = await this.novelRepository
      .createQueryBuilder('novel')
      .where({ is_plus: true })
      .getCount();
    const type_novel_count = await this.novelRepository
      .createQueryBuilder('novel')
      .where({ type: novel.type, is_plus: true })
      .getCount();

    const info = novel.info;
    const l = info.length - 1;

    const latest_info = info.slice(-5, l);

    const view_per_good = info[l].view / info[l].good;
    const view_per_book = info[l].view / info[l].book;

    const view_per_novel_count = total_view / total_novel_count;
    const view_per_type_novel_count = total_type_view / type_novel_count;

    const good_per_novel_count = total_good / total_novel_count;
    const good_per_type_novel_count = total_type_good / type_novel_count;

    const view_per_good_average = total_view / total_good;
    const view_per_book_average = total_view / total_book;

    const view_per_good_platform_average = total_type_view / total_type_good;
    const view_per_book_platform_average = total_type_view / total_type_book;

    let growth_view;
    let growth_good;

    let latest_growth_view;
    let latest_growth_good;

    let serial_rate;
    let latest_serial_rate;

    if (info.length >= 5) {
      growth_view = (info[l].view / info[0].view) ** (1 / info.length) - 1;
      growth_good = (info[l].good / info[0].good) ** (1 / info.length) - 1;

      latest_growth_view =
        (latest_info[5].view / latest_info[0].view) ** (1 / info.length) - 1;
      latest_growth_good =
        (latest_info[5].good / latest_info[0].good) ** (1 / info.length) - 1;

      serial_rate = (1 - info[0].book + info[l].book) / info.length;
      latest_serial_rate =
        (1 - latest_info[0].book + latest_info[5].book) / info.length;
    }

    return {
      ...novel,

      cur_info: info[l],

      growth_view,
      growth_good,

      latest_growth_view,
      latest_growth_good,

      serial_rate,
      latest_serial_rate,

      view_per_good,
      view_per_book,

      view_per_good_average,
      view_per_book_average,

      view_per_novel_count,
      view_per_type_novel_count,

      total_novel_count,
      type_novel_count,

      good_per_novel_count,
      good_per_type_novel_count,

      view_per_good_platform_average,
      view_per_book_platform_average,

      search_response,
    };
  }

  private async selectLink(link: string) {
    return await this.novelRepository.findOne({
      relations: ['info'],
      where: { link },
    });
  }

  private async crawling(body: NovelLinkDto): Promise<CrawlingResponse> {
    const response = await this.amqpConnection.request<CrawlingResponse>({
      exchange: '',
      routingKey: 'novel.link',
      payload: body,
      timeout: 10000,
    });
    return response;
  }
}
