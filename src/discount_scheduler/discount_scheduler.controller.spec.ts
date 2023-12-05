import { Test, TestingModule } from '@nestjs/testing';
import { DiscountSchedulerController } from './discount_scheduler.controller';
import { DiscountSchedulerService } from './discount_scheduler.service';

describe('DiscountSchedulerController', () => {
  let controller: DiscountSchedulerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountSchedulerController],
      providers: [DiscountSchedulerService],
    }).compile();

    controller = module.get<DiscountSchedulerController>(DiscountSchedulerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
