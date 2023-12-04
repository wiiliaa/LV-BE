import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';

@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) { }

  async checkout(orderId: number, ab: string, res: Response) {
    const findShopid = await this.orderService.findShopByOrderId(orderId);
    console.log("-------------findShopid.shop_payment", findShopid.shop_payment)
    const a = await findShopid.shop_payment;
    const stripe = require('stripe')(
      'sk_test_51O8Gv7IHrHSi5RteLXMGDZPC0rX3ZgYlJQXImFOpgDvi0qSDdlR1Vk38phyrZNv3Jcqluhn99nrz91gFUevLP1Mz00iqTwdjII',
    );

    const order = await this.orderService.findId(orderId);
    const line_items = order.order_items.map((orderItem, index) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Total',
        },
        unit_amount: order.total * 100,
      },
      quantity: orderItem.quantity,
    }));
    console.log('Order:', order);
    console.log('Order Items:', order.order_items);

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      customer: ab,
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
