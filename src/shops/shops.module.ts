import { Module } from '@nestjs/common';
import { ShopService } from './shops.service';
import { ShopController } from './shops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ImageModule } from 'src/image/image.module';
import { Notifiy } from 'src/notifiy/entities/notifiy.entity';
import { NotifiyModule } from 'src/notifiy/notifiy.module';
import { OrderModule } from 'src/order/order.module';
import { ProductModule } from 'src/product/product.module';
@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [
    TypeOrmModule.forFeature([Shop]),
    ImageModule,
    NotifiyModule,
    OrderModule,
    ProductModule,
  ],
})
export class ShopsModule {}
