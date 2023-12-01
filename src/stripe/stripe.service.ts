import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { Response } from 'express';

const stripe = require('stripe')(
  'sk_test_51O8Gv7IHrHSi5RteLXMGDZPC0rX3ZgYlJQXImFOpgDvi0qSDdlR1Vk38phyrZNv3Jcqluhn99nrz91gFUevLP1Mz00iqTwdjII',
);
@Injectable()
export class StripeService {
  constructor(private orderService: OrderService) {}
  YOUR_DOMAIN = ' http://localhost:3456/';
  async checkout(orderId: number) {
    try {
      // Tìm order dựa trên orderId từ OrderService hoặc từ cơ sở dữ liệu của bạn
      const order = await this.orderService.findId(orderId);
      console.log(order.order_items);
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

      // Gọi Stripe API để tạo checkout session với các line items
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: ' http://localhost:3456/products/getAll', // Thay thế bằng đường dẫn thực tế
        cancel_url: ' http://localhost:3456/stripe/cancel', // Thay thế bằng đường dẫn thực tế
      });

      return { sessionId: session.id, checkoutUrl: session.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new NotFoundException('Internal Server Error');
    }
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
