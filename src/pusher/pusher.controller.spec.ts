import { Test, TestingModule } from '@nestjs/testing';
import { PusherController } from './pusher.controller';
import { PusherService } from './pusher.service';

describe('PusherController', () => {
  let controller: PusherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PusherController],
      providers: [PusherService],
    }).compile();

    controller = module.get<PusherController>(PusherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
