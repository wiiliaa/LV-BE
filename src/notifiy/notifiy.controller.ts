import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { NotifiyService } from './notifiy.service';
import { CreateNotifiyDto } from './dto/create-notifiy.dto';
import { UpdateNotifiyDto } from './dto/update-notifiy.dto';

@Controller('notifiy')
export class NotifiyController {
  constructor(private readonly notifiyService: NotifiyService) {}
  @Post(':userId')
  async createNotification(
    @Param('userId') userId: number,
    @Body('content') content: string,
  ) {
    const createdNotification = await this.notifiyService.createNotification(
      userId,
      content,
    );

    return createdNotification;
  }

  @Get(':userId')
  async getAllNotifications(@Param('userId') userId: number) {
    const notifications = await this.notifiyService.getAllNotifications(userId);

    return notifications;
  }
}
