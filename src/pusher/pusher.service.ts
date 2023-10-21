import { Injectable } from '@nestjs/common';
import { CreatePusherDto } from './dto/create-pusher.dto';
import { UpdatePusherDto } from './dto/update-pusher.dto';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  pusher: Pusher;
  constructor() {
    this.pusher = new Pusher({
      appId: '1692213',
      key: '38a28d65d9ca618d159a',
      secret: '20257f819db62c780bad',
      cluster: 'ap1',
      useTLS: true,
    });
  }

  async trigger(channel: string, event: string, data: any) {
    await this.pusher.trigger(channel, event, data);
  }
}
