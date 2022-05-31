import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn({ nullable: true, select: false })
  createdAt: Date;
  @CreateDateColumn({ nullable: true, select: false })
  updatedAt: Date;
}
