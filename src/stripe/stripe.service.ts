import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';

const stripe = require('stripe')(
  'sk_test_51O8Gv7IHrHSi5RteLXMGDZPC0rX3ZgYlJQXImFOpgDvi0qSDdlR1Vk38phyrZNv3Jcqluhn99nrz91gFUevLP1Mz00iqTwdjII',
);
@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) { }

  async checkout(orderId: number, res: Response) {
    // Tìm order dựa trên orderId từ OrderService hoặc từ cơ sở dữ liệu của bạn
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
      customer: 'cus_P7MRva6pDlIcHf',
      success_url:
        'http://localhost:3000',
      cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
    });

    return res.status(302).redirect(session.url);
  }
  async Successpayment(session_id: any) {
    const billing_detail = await stripe.checkout.sessions.listLineItems(
      session_id,
    );
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log(billing_detail, session);
  }

  async Failedpayment(session_id: any) { }
}
