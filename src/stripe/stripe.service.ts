import { ConsoleLogger, Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { ImageService } from 'src/image/image.service';
import { ProductService } from 'src/product/product.service';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class StripeService {
  constructor(
    private orderService: OrderService,
    private imageService: ImageService,
    private usera: UserService,
  ) {}
  async checkout(orderId: number, res: Response) {
    try {
      const ab = await this.orderService.findShopByOrderId(orderId);
      const stripe = require('stripe')(ab.shop_payment);

      const order = await this.orderService.findId(orderId);
      const customer = await stripe.customers.create({
        metadata: {
          userId: order.user_id,
        },
      });
      const name = await this.usera.getName(order.user_id);
      const line_items = order.order_items.map((orderItem, index) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: name,
          },
          unit_amount: orderItem.discountedPrice * 100,
        },
        quantity: orderItem.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',

        payment_intent_data: {
          setup_future_usage: 'on_session',
        },
        success_url: 'http://localhost:3000', // Replace with your actual success URL
        cancel_url: 'http://localhost:3000/pay/failed/checkout/session',
      });

      // Assume the payment was successful if the Stripe checkout session was created
      // Update order status to 'paid'

      // Redirect the user to the Stripe checkout page

      await this.orderService.markOrderAsDone(orderId);
      return res.send({ URL: session.url });
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
