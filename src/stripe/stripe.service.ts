import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';

@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) { }

  async checkout(orderId: number, res: Response) {
    const findShopid = await this.orderService.findShopByOrderId(orderId);
    console.log("-------------findShopid.shop_payment", findShopid.shop_payment)
    const a = await findShopid.shop_payment;
    const findUser = await this.orderService.findId(orderId);
    const b = await findUser.id;
    const stripe = require('stripe')(a);

    const order = await this.orderService.findId(orderId);
    if (!order || !order.order_items) {
      throw new NotFoundException('Order not found');
    }

    const line_items = order.order_items.map((orderItem) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: orderItem.version.color },
        unit_amount: orderItem.version.product.price * 100,
      },
      quantity: orderItem.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      customer: b,
      success_url: 'http://localhost:3000',
      cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
    });

    return res.status(302).redirect(session.url);
  }
  // async Successpayment(session_id: any) {
  //   const billing_detail = await stripe.checkout.sessions.listLineItems(
  //     session_id,
  //   );
  //   const session = await stripe.checkout.sessions.retrieve(session_id);

  //   console.log(billing_detail, session);
  // }

  // async Failedpayment(session_id: any) {}
}
