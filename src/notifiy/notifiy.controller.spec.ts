import { Test, TestingModule } from '@nestjs/testing';
import { NotifiyController } from './notifiy.controller';
import { NotifiyService } from './notifiy.service';

describe('NotifiyController', () => {
  let controller: NotifiyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotifiyController],
      providers: [NotifiyService],
    }).compile();

    controller = module.get<NotifiyController>(NotifiyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
