import { Injectable } from '@nestjs/common';
import { CreateNotifiyDto } from './dto/create-notifiy.dto';
import { UpdateNotifiyDto } from './dto/update-notifiy.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Notifiy } from './entities/notifiy.entity';

@Injectable()
export class NotifiyService {
  constructor(
    @InjectRepository(Notifiy)
    private readonly notificationRepository: Repository<Notifiy>,
    private userService: UserService,
  ) {}

  async createNotification(userId: number, content: string): Promise<Notifiy> {
    const user = await this.userService.findById(userId);

    // Create a new notification entity
    const notification = new Notifiy();
    notification.content = content;
    notification.user_id = user.id; // Assuming your Notification entity has a 'user' relation

    // Save the notification to the database
    const savedNotification = await this.notificationRepository.save(
      notification,
    );

    return savedNotification;
  }

  async getAllNotifications(userId: number) {
    const user = await this.userService.findNoti(userId);

    if (!user) {
      // Handle the case when the user is not found
      return `User with ID ${userId} not found.`;
    }

    return user.notifications || []; // Return an empty array if user.notifications is undefined
  }
}
