import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductModule } from './product/product.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { CommentsModule } from './comments/comments.module';
import { DiscountsModule } from './discounts/discounts.module';
import { ProductSizeModule } from './product_size/product_size.module';
import { UserPaymentsModule } from './user_payments/user_payments.module';
import { PaymentDetailsModule } from './payment_details/payment_details.module';
import { ShopsModule } from './shops/shops.module';
import { CartsModule } from './carts/carts.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { OrderModule } from './order/order.module';
import { PusherModule } from './pusher/pusher.module';
import { ProductCategoriesModule } from './product_categories/product_categories.module';
import { SearchKeywordModule } from './search_keyword/search_keyword.module';
import { StripeModule } from './stripe/stripe.module';
import { ImageModule } from './image/image.module';
import { ProductVersionModule } from './product-version/product-version.module';
import { DiscountSchedulerModule } from './discount_scheduler/discount_scheduler.module';
import { NotifiyModule } from './notifiy/notifiy.module';
import config from './config/TypeOrm.config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot(config),
    ProductModule,
    OrderItemsModule,
    CommentsModule,
    DiscountsModule,
    ProductSizeModule,
    UserPaymentsModule,
    PaymentDetailsModule,
    ShopsModule,
    CartsModule,
    CartItemsModule,
    OrderModule,
    PusherModule,
    ProductCategoriesModule,
    SearchKeywordModule,
    StripeModule,
    ImageModule,
    ProductVersionModule,
    DiscountSchedulerModule,
    NotifiyModule,
  ],
})
export class AppModule {}
