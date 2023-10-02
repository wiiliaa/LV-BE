import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsUsageService } from './discounts_usage.service';

describe('DiscountsUsageService', () => {
  let service: DiscountsUsageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountsUsageService],
    }).compile();

    service = module.get<DiscountsUsageService>(DiscountsUsageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
