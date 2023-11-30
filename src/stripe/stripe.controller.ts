import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Res,
  Get,
  Param,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Order } from 'src/order/entities/order.entity';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  // @Post('checkout')
  // async checkout(@Body() order: Order) {
  //   try {
  //     const paymentIntent = await this.stripeService.checkout(order);
  //     return { message: 'Thanh toán thành công', paymentIntent };
  //   } catch (error) {
  //     throw new HttpException('Lỗi thanh toán', HttpStatus.BAD_REQUEST);
  //   }
  // }

  @Get(':id')
  async getPaymentLink(@Param('id') id: number) {
    return this.stripeService.checkout(id);
  }

  @Get('/success/checkout/session')
  async Successpayment(@Res({ passthrough: true }) res) {
    return this.stripeService.Successpayment(res.req.query.session_id);
  }
  @Get('/failed/checkout/session')
  async Failedpayment(@Res({ passthrough: true }) res) {
    var details = await this.stripeService.Failedpayment(
      res.req.query.session_id,
    );
  }
}
