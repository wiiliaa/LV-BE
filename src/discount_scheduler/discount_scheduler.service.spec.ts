import { Test, TestingModule } from '@nestjs/testing';
import { DiscountSchedulerService } from './discount_scheduler.service';

describe('DiscountSchedulerService', () => {
  let service: DiscountSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountSchedulerService],
    }).compile();

    service = module.get<DiscountSchedulerService>(DiscountSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
