import { Test, TestingModule } from '@nestjs/testing';
import { NotifiyService } from './notifiy.service';

describe('NotifiyService', () => {
  let service: NotifiyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotifiyService],
    }).compile();

    service = module.get<NotifiyService>(NotifiyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
