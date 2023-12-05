import { Module } from '@nestjs/common';
import { NotifiyService } from './notifiy.service';
import { NotifiyController } from './notifiy.controller';
import { UserModule } from 'src/user/user.module';
import { Notifiy } from './entities/notifiy.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [NotifiyController],
  providers: [NotifiyService],
  imports: [TypeOrmModule.forFeature([Notifiy]), UserModule],
  exports: [NotifiyService],
})
export class NotifiyModule {}
