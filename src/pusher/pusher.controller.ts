import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PusherService } from './pusher.service';

@Controller('pusher')
export class PusherController {
  constructor(private pusherService: PusherService) {}

  @Post('message')
  async mesages(
    @Body('username') username: string,
    @Body('message') message: string,
  ) {
    await this.pusherService.trigger('chat', message, {
      username,
      message,
    });
    return [];
  }
}
