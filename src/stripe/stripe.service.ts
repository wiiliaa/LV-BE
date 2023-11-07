import { Injectable } from '@nestjs/common';
import { Cart } from 'src/carts/entities/cart.entity';
import { Order } from 'src/order/entities/order.entity';

import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
  }

  checkout(order: Order) {
    // Sử dụng trường 'total' để lấy tổng số tiền của đơn hàng
    return this.stripe.paymentIntents.create({
      amount: +order.total.toFixed(2) * 100, // cents
      currency: 'usd',
      payment_method_types: ['card'],
      // Thêm thông tin thanh toán khác dựa trên đơn hàng nếu cần
    });
  }
}
