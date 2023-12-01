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
import { Response } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private stripeService: StripeService) {}

  @Get(':id')
  async getPaymentLink(@Param('id') id: number, @Res() res: Response) {
    return this.stripeService.checkout(id, res);
  }

  @Get('/pay/success/checkout/session/:session_id')
  async successPayment(@Res({ passthrough: true }) res) {
    await this.stripeService.Successpayment(res);
    // Gửi phản hồi hoặc thực hiện các xử lý khác nếu cần
  }

  @Get('/failed/checkout/session')
  async Failedpayment(@Res({ passthrough: true }) res) {
    var details = await this.stripeService.Failedpayment(
      res.req.query.session_id,
    );
  }
}
