import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsUsageController } from './discounts_usage.controller';
import { DiscountsUsageService } from './discounts_usage.service';

describe('DiscountsUsageController', () => {
  let controller: DiscountsUsageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsUsageController],
      providers: [DiscountsUsageService],
    }).compile();

    controller = module.get<DiscountsUsageController>(DiscountsUsageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
