import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { NovelInfoEntity } from './novel-info.entity';

export enum PlatformType {
  NOVELPIA = 'NOVELPIA',
  MUNPIA = 'MUNPIA',
  KAKAOPAGE = 'KAKAOPAGE',
}

@Entity('novel')
export class NovelEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: PlatformType,
    default: PlatformType.NOVELPIA,
  })
  type: PlatformType;

  @Column({
    nullable: true,
  })
  thumbnail: string;

  @Column()
  link: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  is_end: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_plus: boolean;

  @Column({
    default: 0,
  })
  age_limit: number;

  @Column()
  author: string;

  @Column()
  description: string;

  @OneToMany(() => NovelInfoEntity, (info) => info.novel, {
    onDelete: 'CASCADE',
  })
  info: NovelInfoEntity[];
}
