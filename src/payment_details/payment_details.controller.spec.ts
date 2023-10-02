import { Test, TestingModule } from '@nestjs/testing';
import { PaymentDetailsController } from './payment_details.controller';
import { PaymentDetailsService } from './payment_details.service';

describe('PaymentDetailsController', () => {
  let controller: PaymentDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentDetailsController],
      providers: [PaymentDetailsService],
    }).compile();

    controller = module.get<PaymentDetailsController>(PaymentDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
