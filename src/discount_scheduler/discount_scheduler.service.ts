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
    // Lập lịch chạy mỗi ngày lúc 10:10 sáng
    schedule.scheduleJob('0 0 * * *', async () => {
      await this.discountsService.deleteExpiredDiscounts();
    });
  }
}
