import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { ImageModule } from 'src/image/image.module';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [OrderModule, UserModule, ImageModule, UserModule],
})
export class StripeModule {}
