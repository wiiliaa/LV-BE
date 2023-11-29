import { Module } from '@nestjs/common';
import { CategoryItemsService } from './category_items.service';
import { CategoryItemsController } from './category_items.controller';

@Module({
  controllers: [CategoryItemsController],
  providers: [CategoryItemsService]
})
export class CategoryItemsModule {}
