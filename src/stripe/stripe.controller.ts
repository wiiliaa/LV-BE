import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Order } from 'src/order/entities/order.entity';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Post('checkout')
  async checkout(@Body() order: Order) {
    try {
      const paymentIntent = await this.stripeService.checkout(order);
      return { message: 'Thanh toán thành công', paymentIntent };
    } catch (error) {
      throw new HttpException('Lỗi thanh toán', HttpStatus.BAD_REQUEST);
    }
  }
}
