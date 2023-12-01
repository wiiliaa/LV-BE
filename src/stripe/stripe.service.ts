import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';

const stripe = require('stripe')(
  'sk_test_51O8Gv7IHrHSi5RteLXMGDZPC0rX3ZgYlJQXImFOpgDvi0qSDdlR1Vk38phyrZNv3Jcqluhn99nrz91gFUevLP1Mz00iqTwdjII',
);
@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) {}

  async checkout(id: number, res: Response) {
    const order = await this.orderService.findId(id);

    // Tạo mảng line_items từ order_items trong đơn hàng
    const line_items = order.order_items.map((orderItem) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: orderItem.version.color }, // Tên sản phẩm
        unit_amount: orderItem.version.product.price * 100, // Giá của mỗi sản phẩm
      },
      quantity: orderItem.quantity, // Số lượng sản phẩm
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      customer: 'cus_P6anHmYjfVpw4u',
      success_url:
        'http://localhost:3456/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
    });

    return res.status(302).redirect(session.url);
  }

  async Successpayment(session_id: any) {
    // const billing_detail = await stripe.checkout.sessions.listLineItems(
    //   session_id,
    // );
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log(session);
  }

  async Failedpayment(session_id: any) {}
}
