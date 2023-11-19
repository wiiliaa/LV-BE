import { Module } from '@nestjs/common';
import { PusherService } from './pusher.service';
import { PusherController } from './pusher.controller';

@Module({
  controllers: [PusherController],
  providers: [PusherService]
})
export class PusherModule {}
