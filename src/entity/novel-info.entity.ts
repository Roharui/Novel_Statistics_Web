import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NovelEntity } from './novels.entity';

@Entity('novel-info')
export class NovelInfoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at!: Date;

  @Column()
  view: number;

  @Column()
  good: number;

  @Column()
  book: number;

  @JoinColumn({ name: 'novel_id' })
  @ManyToOne(() => NovelEntity, (novel) => novel.info)
  novel: NovelEntity;
}
