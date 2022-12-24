import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { NovelEpisodeEntity } from 'src/entity/novel-episode.entity';
import { NovelInfoEntity } from 'src/entity/novel-info.entity';
import { NovelEntity } from 'src/entity/novels.entity';
import { DataSource, Repository } from 'typeorm';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelRepository: Repository<NovelEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async analyze(url: string): Promise<AnalyzeNovelDto> {
    const novel = await this.selectLink(url);

    if (novel === null) {
      throw new BadRequestException('등록되지 않는 소설입니다.');
    }

    const reader_prefer_cur = await this.dataSource
      .createQueryBuilder()
      .select([])
      .addSelect('cur')
      .addSelect('percentage')
      .from(
        (sub) =>
          sub
            .select('(ni."good"::float / ni."view") * 100', 'cur')
            .addSelect(
              'PERCENT_RANK() OVER (ORDER BY (ni."good"::float / ni."view") DESC)',
              'percentage',
            )
            .addSelect('ni.novel_id')
            .from(NovelInfoEntity, 'ni'),
        'rp',
      )
      .where('rp.novel_id = :id', { id: novel.id })
      .getRawOne();

    const reader_prefer_avg = await this.dataSource
      .createQueryBuilder()
      .select([])
      .addSelect(
        (sub) =>
          sub
            .select('avg((ni."good"::float / ni."view")) * 100')
            .from(NovelInfoEntity, 'ni'),
        'avg',
      )
      .addSelect(
        (sub) =>
          sub
            .select('avg((ni."good"::float / ni."view")) * 100')
            .from(NovelInfoEntity, 'ni')
            .innerJoin('novel', 'n', 'n.id = ni.novel_id')
            .where('n."type" = :type', { type: novel.type }),
        'content_avg',
      )
      .fromDummy()
      .getRawOne();

    const view_avg_cur = await this.dataSource
      .createQueryBuilder()
      .select('cur')
      .addSelect('percentage')
      .from(
        (sub) =>
          sub
            .select('(ni."view"::float / ni."book")', 'cur')
            .addSelect(
              'PERCENT_RANK() OVER (ORDER BY (ni."view"::float / ni."book") DESC)',
              'percentage',
            )
            .addSelect('ni.novel_id')
            .from(NovelInfoEntity, 'ni'),
        'rp',
      )
      .where('rp.novel_id = :id', { id: novel.id })
      .getRawOne();

    const view_avg_avg = await this.dataSource
      .createQueryBuilder()
      .select([])
      .addSelect(
        (sub) =>
          sub
            .select('avg((ni."view"::float / ni."book"))')
            .from(NovelInfoEntity, 'ni'),
        'avg',
      )
      .addSelect(
        (sub) =>
          sub
            .select('avg((ni."view"::float / ni."book"))')
            .from(NovelInfoEntity, 'ni')
            .innerJoin('novel', 'n', 'n.id = ni.novel_id')
            .where('n."type" = :type', { type: novel.type }),
        'content_avg',
      )
      .fromDummy()
      .getRawOne();

    const read_rate_cur = await this.dataSource
      .createQueryBuilder()
      .select('tb.cur', 'cur')
      .addSelect('tb.percentage', 'percentage')
      .from(
        (sub) =>
          sub
            .select('ed_ne.novel_id')
            .addSelect(
              '(1 - power((ed_ne."view"::float / st_ne."view"), (1::float / (ed_ne.idx - st_ne.idx)))) * 100',
              'cur',
            )
            .addSelect(
              'PERCENT_RANK() OVER (ORDER BY (1 - power((ed_ne."view"::float / st_ne."view"), (1::float / (ed_ne.idx - st_ne.idx)))) asc)',
              'percentage',
            )
            .from(
              (sub) =>
                sub
                  .select('ne.novel_id')
                  .addSelect('ne.view', 'view')
                  .addSelect('idx.idx')
                  .from(NovelEpisodeEntity, 'ne')
                  .innerJoin(
                    (sub) =>
                      sub
                        .select('ne.novel_id')
                        .addSelect('max(ne.idx)', 'idx')
                        .from(NovelEpisodeEntity, 'ne')
                        .groupBy('ne.novel_id')
                        .having('max(ne.idx) >= 15'),
                    'idx',
                    'idx.novel_id = ne.novel_id and idx.idx = ne.idx',
                  ),
              'ed_ne',
            )
            .innerJoin(
              (sub) =>
                sub
                  .select('ne.novel_id')
                  .addSelect('ne.view', 'view')
                  .addSelect('idx.idx')
                  .from(NovelEpisodeEntity, 'ne')
                  .innerJoin(
                    (sub) =>
                      sub
                        .select('ne.novel_id')
                        .addSelect('3', 'idx')
                        .from(NovelEpisodeEntity, 'ne')
                        .groupBy('ne.novel_id')
                        .having('max(ne.idx) >= 15'),
                    'idx',
                    'idx.novel_id = ne.novel_id and idx.idx = ne.idx',
                  ),
              'st_ne',
              'st_ne.novel_id = ed_ne.novel_id',
            ),
        'tb',
      )
      .where('tb.novel_id = :id', { id: novel.id })
      .getRawOne();

    const { avg: read_rate_avg } = await this.dataSource
      .createQueryBuilder()
      .select(
        'avg(1 - power((ed_ne."view"::float / st_ne."view"), (1::float / (ed_ne.idx - st_ne.idx)))) * 100',
        'avg',
      )
      .from(
        (sub) =>
          sub
            .select('ne.novel_id')
            .addSelect('ne.view', 'view')
            .addSelect('idx.idx')
            .from(NovelEpisodeEntity, 'ne')
            .innerJoin(
              (sub) =>
                sub
                  .select('ne.novel_id')
                  .addSelect('max(ne.idx) - 3', 'idx')
                  .from(NovelEpisodeEntity, 'ne')
                  .groupBy('ne.novel_id')
                  .having('max(ne.idx) >= 15'),
              'idx',
              'idx.novel_id = ne.novel_id and idx.idx = ne.idx',
            ),
        'ed_ne',
      )
      .innerJoin(
        (sub) =>
          sub
            .select('ne.novel_id')
            .addSelect('ne.view', 'view')
            .addSelect('idx.idx')
            .from(NovelEpisodeEntity, 'ne')
            .innerJoin(
              (sub) =>
                sub
                  .select('ne.novel_id')
                  .addSelect('3', 'idx')
                  .from(NovelEpisodeEntity, 'ne')
                  .groupBy('ne.novel_id')
                  .having('max(ne.idx) >= 15'),
              'idx',
              'idx.novel_id = ne.novel_id and idx.idx = ne.idx',
            ),
        'st_ne',
        'st_ne.novel_id = ed_ne.novel_id',
      )
      .getRawOne();

    const { avg: read_rate_cavg } = await this.dataSource
      .createQueryBuilder()
      .select(
        'avg(1 - power((ed_ne."view"::float / st_ne."view"), (1::float / (ed_ne.idx - st_ne.idx)))) * 100',
        'avg',
      )
      .from(
        (sub) =>
          sub
            .select('ne.novel_id')
            .addSelect('ne.view', 'view')
            .addSelect('idx.idx')
            .from(NovelEpisodeEntity, 'ne')
            .innerJoin(
              (sub) =>
                sub
                  .select('ne.novel_id')
                  .addSelect('max(ne.idx) - 3', 'idx')
                  .from(NovelEpisodeEntity, 'ne')
                  .groupBy('ne.novel_id')
                  .having('max(ne.idx) >= 15'),
              'idx',
              'idx.novel_id = ne.novel_id and idx.idx = ne.idx',
            ),
        'ed_ne',
      )
      .innerJoin(
        (sub) =>
          sub
            .select('ne.novel_id')
            .addSelect('ne.view', 'view')
            .addSelect('idx.idx')
            .from(NovelEpisodeEntity, 'ne')
            .innerJoin(
              (sub) =>
                sub
                  .select('ne.novel_id')
                  .addSelect('3', 'idx')
                  .from(NovelEpisodeEntity, 'ne')
                  .groupBy('ne.novel_id')
                  .having('max(ne.idx) >= 15'),
              'idx',
              'idx.novel_id = ne.novel_id and idx.idx = ne.idx',
            ),
        'st_ne',
        'st_ne.novel_id = ed_ne.novel_id',
      )
      .innerJoin(NovelEntity, 'n', 'n.id = ed_ne.novel_id')
      .where(' n."type" = :type', { type: novel.type })
      .getRawOne();

    const upload_rate_cur = await this.dataSource
      .createQueryBuilder()
      .select('tb.cur', 'cur')
      .addSelect('tb.percentage', 'percentage')
      .from(
        (sub) =>
          sub
            .select('ne.novel_id', 'novel_id')
            .addSelect('(count(ne."idx") / 21::float)', 'cur')
            .addSelect(
              'PERCENT_RANK() OVER (ORDER BY (count(ne."idx") / 21::float) desc)',
              'percentage',
            )
            .from(NovelEpisodeEntity, 'ne')
            .where('ne."date" >= now() - INTERVAL \'21 day\'')
            .groupBy('ne.novel_id'),
        'tb',
      )
      .where('tb.novel_id  = :id', { id: novel.id })
      .getRawOne();

    const { avg: upload_rate_avg } = await this.dataSource
      .createQueryBuilder()
      .select('avg(x.cur)', 'avg')
      .from(
        (sub) =>
          sub
            .select('ne.novel_id', 'novel_id')
            .addSelect('(count(ne."idx") / 21::float)', 'cur')
            .addSelect(
              'PERCENT_RANK() OVER (ORDER BY (count(ne."idx") / 21::float) desc)',
              'percentage',
            )
            .from(NovelEpisodeEntity, 'ne')
            .where('ne."date" >= now() - INTERVAL \'21 day\'')
            .groupBy('ne.novel_id'),
        'x',
      )
      .getRawOne();

    const { avg: upload_rate_cavg } = await this.dataSource
      .createQueryBuilder()
      .select('avg(x.cur)', 'avg')
      .from(
        (sub) =>
          sub
            .select('ne.novel_id', 'novel_id')
            .addSelect('(count(ne."idx") / 21::float)', 'cur')
            .addSelect(
              'PERCENT_RANK() OVER (ORDER BY (count(ne."idx") / 21::float) desc)',
              'percentage',
            )
            .from(NovelEpisodeEntity, 'ne')
            .innerJoin(NovelEntity, 'n', 'n.id = ne.novel_id')
            .where('ne."date" >= now() - INTERVAL \'21 day\'')
            .andWhere('n.type = :type', { type: novel.type })
            .groupBy('ne.novel_id'),
        'x',
      )
      .getRawOne();

    return {
      novel,
      reader_prefer: { ...reader_prefer_avg, ...reader_prefer_cur },
      view_avg: { ...view_avg_cur, ...view_avg_avg },
      reading_rate: {
        ...read_rate_cur,
        avg: read_rate_avg,
        content_avg: read_rate_cavg,
      },
      upload_rate: {
        ...upload_rate_cur,
        avg: upload_rate_avg,
        content_avg: upload_rate_cavg,
      },
    };
  }

  private async selectLink(link: string) {
    return await this.novelRepository.findOne({
      where: { link },
    });
  }
}
