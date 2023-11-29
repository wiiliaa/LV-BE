import { Test, TestingModule } from '@nestjs/testing';
import { CategoryItemsController } from './category_items.controller';
import { CategoryItemsService } from './category_items.service';

describe('CategoryItemsController', () => {
  let controller: CategoryItemsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryItemsController],
      providers: [CategoryItemsService],
    }).compile();

    controller = module.get<CategoryItemsController>(CategoryItemsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
