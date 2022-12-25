import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { NovelEpisodeEntity } from 'src/entity/novel-episode.entity';
import { NovelInfoEntity } from 'src/entity/novel-info.entity';
import { NovelEntity } from 'src/entity/novels.entity';
import { DataSource, Repository } from 'typeorm';
import { AnalyzeNovelDto } from './dto/novel-analyze.dto';
import { getExpireDate, MergeRecursive } from 'src/utils';
import Redis from 'ioredis';

@Injectable()
export class NovelService {
  constructor(
    @InjectRepository(NovelEntity)
    private novelRepository: Repository<NovelEntity>,
    @InjectDataSource()
    private dataSource: DataSource,
    @InjectRedis()
    private client: Redis,
  ) {}

  async analyze(url: string): Promise<AnalyzeNovelDto> {
    const novel = await this.selectLink(url);

    if (novel === null) {
      throw new BadRequestException('등록되지 않는 소설입니다.');
    }

    const redis_result_str = await this.client.get(`NOVEL:${novel.id}`);
    let redis_result = {};

    if (redis_result_str !== null) {
      redis_result = JSON.parse(redis_result_str);
    } else {
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
              .from(NovelInfoEntity, 'ni')
              .innerJoin(
                (sub) =>
                  sub
                    .select('max(ni.id)', 'id')
                    .from(NovelInfoEntity, 'ni')
                    .groupBy('ni.novel_id'),
                'nm',
                'nm.id = ni.id',
              ),
          'rp',
        )
        .where('rp.novel_id = :id', { id: novel.id })
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
              .from(NovelInfoEntity, 'ni')
              .innerJoin(
                (sub) =>
                  sub
                    .select('max(ni.id)', 'id')
                    .from(NovelInfoEntity, 'ni')
                    .groupBy('ni.novel_id'),
                'nm',
                'nm.id = ni.id',
              ),
          'rp',
        )
        .where('rp.novel_id = :id', { id: novel.id })
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

      const episode = await this.episode(novel.id);
      const growth = await this.growth(novel.id);

      redis_result = {
        novel,
        reader_prefer: reader_prefer_cur,
        view_avg: view_avg_cur,
        reading_rate: read_rate_cur,
        upload_rate: upload_rate_cur,
        episode,
        growth,
      };

      await this.client.set(
        `NOVEL:${novel.id}`,
        JSON.stringify(redis_result),
        'EX',
        getExpireDate(novel.updated_at),
      );
    }

    const avgResult = await this.average(novel.type);

    return MergeRecursive(redis_result, avgResult);
  }

  private async average(type: string) {
    const total_avg_str = await this.client.get('TOTAL:AVG');
    let total_avg = {};

    if (total_avg_str === null) {
      const { avg: reader_prefer_avg } = await this.dataSource
        .createQueryBuilder()
        .select([])
        .addSelect(
          (sub) =>
            sub
              .select('avg((ni."good"::float / ni."view")) * 100')
              .from(NovelInfoEntity, 'ni')
              .innerJoin(
                (sub) =>
                  sub
                    .select('max(ni.id)', 'id')
                    .from(NovelInfoEntity, 'ni')
                    .groupBy('ni.novel_id'),
                'nm',
                'nm.id = ni.id',
              ),
          'avg',
        )
        .fromDummy()
        .getRawOne();

      const { avg: view_avg_avg } = await this.dataSource
        .createQueryBuilder()
        .select([])
        .addSelect(
          (sub) =>
            sub
              .select('avg((ni."view"::float / ni."book"))')
              .from(NovelInfoEntity, 'ni')
              .innerJoin(
                (sub) =>
                  sub
                    .select('max(ni.id)', 'id')
                    .from(NovelInfoEntity, 'ni')
                    .groupBy('ni.novel_id'),
                'nm',
                'nm.id = ni.id',
              ),
          'avg',
        )
        .fromDummy()
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

      total_avg = {
        reader_prefer: { avg: reader_prefer_avg },
        view_avg: { avg: view_avg_avg },
        reading_rate: { avg: read_rate_avg },
        upload_rate: { avg: upload_rate_avg },
      };

      await this.client.set(`TOTAL:AVG`, JSON.stringify(total_avg), 'EX', 30);
    } else {
      total_avg = JSON.parse(total_avg_str);
    }

    const platform_avg_str = await this.client.get(`${type}:AVG`);
    let platform_avg = {};

    if (platform_avg_str === null) {
      const { pavg: reader_prefer_cavg } = await this.dataSource
        .createQueryBuilder()
        .select([])
        .addSelect(
          (sub) =>
            sub
              .select('avg((ni."good"::float / ni."view")) * 100')
              .from(NovelInfoEntity, 'ni')
              .innerJoin(
                (sub) =>
                  sub
                    .select('max(ni.id)', 'id')
                    .from(NovelInfoEntity, 'ni')
                    .groupBy('ni.novel_id'),
                'nm',
                'nm.id = ni.id',
              )
              .innerJoin('novel', 'n', 'n.id = ni.novel_id')
              .where('n."type" = :type', { type }),
          'pavg',
        )
        .fromDummy()
        .getRawOne();

      const { pavg: view_avg_cavg } = await this.dataSource
        .createQueryBuilder()
        .select([])
        .addSelect(
          (sub) =>
            sub
              .select('avg((ni."view"::float / ni."book"))')
              .from(NovelInfoEntity, 'ni')
              .innerJoin(
                (sub) =>
                  sub
                    .select('max(ni.id)', 'id')
                    .from(NovelInfoEntity, 'ni')
                    .groupBy('ni.novel_id'),
                'nm',
                'nm.id = ni.id',
              )
              .innerJoin('novel', 'n', 'n.id = ni.novel_id')
              .where('n."type" = :type', { type }),
          'pavg',
        )
        .fromDummy()
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
        .where(' n."type" = :type', { type })
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
              .andWhere('n.type = :type', { type })
              .groupBy('ne.novel_id'),
          'x',
        )
        .getRawOne();

      platform_avg = {
        reader_prefer: { pavg: reader_prefer_cavg },
        view_avg: { pavg: view_avg_cavg },
        reading_rate: { pavg: read_rate_cavg },
        upload_rate: { pavg: upload_rate_cavg },
      };

      await this.client.set(
        `${type}:AVG`,
        JSON.stringify(platform_avg),
        'EX',
        30,
      );
    } else {
      platform_avg = JSON.parse(platform_avg_str);
    }

    return MergeRecursive(total_avg, platform_avg);
  }

  private async episode(id: number) {
    return await this.dataSource
      .createQueryBuilder()
      .select()
      .from(NovelEpisodeEntity, 'ne')
      .where('ne.novel_id = :id', { id })
      .orderBy('ne.idx', 'DESC')
      .limit(20)
      .getRawMany();
  }

  private async growth(id: number) {
    return await this.dataSource
      .createQueryBuilder()
      .select()
      .from(NovelInfoEntity, 'ni')
      .where('ni.novel_id = :id', { id })
      .orderBy('ni.id', 'DESC')
      .limit(20)
      .getRawMany();
  }

  private async selectLink(link: string) {
    return await this.novelRepository.findOne({
      where: { link },
    });
  }
}
