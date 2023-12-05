import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';

@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) { }
  async checkout(orderId: number, ab: string, res: Response) {
    try {
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

      const stripe = require('stripe')('your_stripe_secret_key'); // Replace with your actual Stripe secret key

      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        customer: ab,
        success_url: 'http://localhost:3000/success', // Replace with your actual success URL
        cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
      });

      // Assume the payment was successful if the Stripe checkout session was created
      // Update order status to 'paid'
      await this.orderService.updateOrderStatus(orderId, 'done');

      // Redirect the user to the Stripe checkout page
      return res.status(302).redirect(session.url);
    } catch (error) {
      console.error('Error initiating Stripe checkout:', error.message);
      // Handle the error and send an appropriate response
      return res.status(500).json({ error: 'Internal Server Error' });
    }
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
