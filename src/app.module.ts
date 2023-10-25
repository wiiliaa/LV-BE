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
import { UserAddressModule } from './user_address/user_address.module';
import { ShopsModule } from './shops/shops.module';
import { CartsModule } from './carts/carts.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { OrderModule } from './order/order.module';
import { DiscountsUsageModule } from './discounts_usage/discounts_usage.module';
import { PusherModule } from './pusher/pusher.module';
import { ProductCategoriesModule } from './product_categories/product_categories.module';
import { SearchKeywordModule } from './search_keyword/search_keyword.module';
import config from './config/TypeOrm.config';

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
    UserAddressModule,
    ShopsModule,
    CartsModule,
    CartItemsModule,
    OrderModule,
    DiscountsUsageModule,
    PusherModule,
    ProductCategoriesModule,
    SearchKeywordModule,
  ],
})
export class AppModule {}
