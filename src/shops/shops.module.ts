import { Module } from '@nestjs/common';
import { ShopService } from './shops.service';
import { ShopController } from './shops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [TypeOrmModule.forFeature([Shop])],
})
export class ShopsModule {}
