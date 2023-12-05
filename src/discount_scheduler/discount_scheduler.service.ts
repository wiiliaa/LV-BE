// discount-scheduler.service.ts

import { Injectable } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { DiscountsService } from 'src/discounts/discounts.service';

@Injectable()
export class DiscountSchedulerService {
  constructor(private readonly discountsService: DiscountsService) {
    this.scheduleJobs();
  }

  private scheduleJobs() {
    // Lập lịch chạy mỗi ngày lúc 00:00
    schedule.scheduleJob('0 0 * * *', async () => {
      // Gọi hàm kiểm tra và xóa discount hết hạn từ service
      await this.discountsService.deleteExpiredDiscounts();
    });
  }
}
