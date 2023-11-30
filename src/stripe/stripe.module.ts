import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { OrderModule } from 'src/order/order.module';

@Module({
  controllers: [StripeController],
  providers: [StripeService],
  imports: [OrderModule],
})
export class StripeModule {}
