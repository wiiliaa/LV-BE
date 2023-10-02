import { Test, TestingModule } from '@nestjs/testing';
import { ProductSizeController } from './product_size.controller';
import { ProductSizeService } from './product_size.service';

describe('ProductSizeController', () => {
  let controller: ProductSizeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSizeController],
      providers: [ProductSizeService],
    }).compile();

    controller = module.get<ProductSizeController>(ProductSizeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
