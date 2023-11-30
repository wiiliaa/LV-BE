import { Injectable } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';

const stripe = require('stripe')(
  'sk_test_51O8Gv7IHrHSi5RteLXMGDZPC0rX3ZgYlJQXImFOpgDvi0qSDdlR1Vk38phyrZNv3Jcqluhn99nrz91gFUevLP1Mz00iqTwdjII',
);
@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) {}

  async checkout(id: number) {
    const order = await this.orderService.findId(id);
    const session = await stripe.checkout.sessions.create({
      line_items: [order.total],
      mode: 'payment',
      payment_intent_data: {
        setup_future_usage: 'on_session',
      },
      customer: order.user_id,
      success_url:
        'http://localhost:3000/pay/success/checkout/session?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
    });
    console.log('session', session);
  }

  async Successpayment(session_id: any) {
    const billing_detail = await stripe.checkout.sessions.listLineItems(
      session_id,
      { limit: 5 },
    );
    const session = await stripe.checkout.sessions.retrieve(session_id);

    console.log(billing_detail, session);
  }

  async Failedpayment(session_id: any) {}
}
