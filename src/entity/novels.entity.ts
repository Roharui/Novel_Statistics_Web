import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base-entity';
import { NovelInfoEntity } from './novel-info.entity';

export enum PlatformType {
  NOVELPIA = 'novelpia',
  MUNPIA = 'munpia',
  KAKAOPAGE = 'kakaopage',
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

  @Column()
  thumbnail: string;

  @Column()
  link: string;

  @OneToMany(() => NovelInfoEntity, (info) => info.novel, {
    cascade: ['insert', 'update', 'remove'],
  })
  info: NovelInfoEntity[];
}
