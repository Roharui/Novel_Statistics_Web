import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { NovelInfoEntity } from 'src/entity/novel-info.entity';
import { NovelEntity } from 'src/entity/novels.entity';
import { NovelController } from './novel.controller';
import { NovelService } from './novel.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NovelEntity, NovelInfoEntity]),
    RabbitMQModule.forRoot(RabbitMQModule, {
      uri: 'amqp://guest:guest@localhost:5672',
    }),
  ],
  controllers: [NovelController],
  providers: [NovelService],
})
export class NovelModule {}
