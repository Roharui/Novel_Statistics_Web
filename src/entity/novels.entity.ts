import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base-entity";

export enum PlatformType {
  NOVELPIA="novelpia",
  MUNPIA="munpia",
  KAKAOPAGE="kakaopage",
}

@Entity("novel")
export class NovelEntity extends BaseEntity{
  @Column()
  title: string;

  @Column({
    type: "enum",
    enum: PlatformType,
    default: PlatformType.NOVELPIA
  })
  type: PlatformType;

  @Column()
  thumbnail: string;

  @Column()
  view: number;
  
  @Column()
  good: number;
  
  @Column()
  book: number;

  @Column()
  link: string;
}