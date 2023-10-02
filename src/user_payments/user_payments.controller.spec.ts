import { Test, TestingModule } from '@nestjs/testing';
import { UserPaymentsController } from './user_payments.controller';
import { UserPaymentsService } from './user_payments.service';

describe('UserPaymentsController', () => {
  let controller: UserPaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserPaymentsController],
      providers: [UserPaymentsService],
    }).compile();

    controller = module.get<UserPaymentsController>(UserPaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
