import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpException,
  Res,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Order } from 'src/order/entities/order.entity';
import { Response } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get(':id')
  async checkout(@Param('id') id: number, @Query('ab') ab: string, @Res() res) {
    return this.stripeService.checkout(id, ab, res);
  }

  // @Get('/pay/success/checkout/session/:session_id')
  // async successPayment(@Param('session_id') session_id: string) {
  //   await this.stripeService.Successpayment(session_id);
  //   // Gửi phản hồi hoặc thực hiện các xử lý khác nếu cần
  // }

  // @Get('/failed/checkout/session')
  // async Failedpayment(@Res({ passthrough: true }) res) {
  //   var details = await this.stripeService.Failedpayment(
  //     res.req.query.session_id,
  //   );
  // }
}
