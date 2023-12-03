import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [OrderModule, UserModule],
})
export class StripeModule {}
