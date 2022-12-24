import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { NovelEntity } from './novels.entity';

@Entity('novel-episode')
export class NovelEpisodeEntity extends BaseEntity {
  @Column()
  idx: number;

  @Column()
  title: string;

  @Column()
  word_size: string;

  @Column()
  view: number;

  @Column()
  good: number;

  @Column()
  comment: number;

  @Column({ type: 'date' })
  date: string;

  @JoinColumn({ name: 'novel_id' })
  @ManyToOne(() => NovelEntity, (novel) => novel.info)
  novel: NovelEntity;
}
