import { Module } from '@nestjs/common';
import { ShopService } from './shops.service';
import { ShopController } from './shops.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { ImageModule } from 'src/image/image.module';
@Module({
  controllers: [ShopController],
  providers: [ShopService],
  imports: [TypeOrmModule.forFeature([Shop]), ImageModule],
})
export class ShopsModule {}
