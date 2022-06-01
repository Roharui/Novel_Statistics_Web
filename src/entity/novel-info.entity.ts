import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from './base-entity';
import { NovelEntity } from './novels.entity';

@Entity('novel-info')
export class NovelInfoEntity extends BaseEntity {
  @Column()
  view: number;

  @Column()
  good: number;

  @Column()
  book: number;

  @ManyToOne(() => NovelEntity, (novel) => novel.info)
  novel: NovelEntity;
}
