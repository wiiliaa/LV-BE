import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from 'src/order_items/entities/order_item.entity';
import { CartItem } from 'src/cart_items/entities/cart_item.entity';
import { Cart } from 'src/carts/entities/cart.entity';
import { ProductSize } from 'src/product_size/entities/product_size.entity';
import { Image } from 'src/image/entities/image.entity';
import { ImageModule } from 'src/image/image.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserModule } from 'src/user/user.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  controllers: [OrderController],
  providers: [OrderService],
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CartItem, Cart, ProductSize]),
    ImageModule,
    UserModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587, // or the port your SMTP server uses
        secure: false, // set to true if using SSL
        auth: {
          user: 'datduong010@gmail.com',
          pass: 'leul qngo dzgo bmhi',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: process.cwd() + '/src/order/template', // Đường dẫn tới thư mục chứa các file template
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  exports: [OrderService],
})
export class OrderModule {}
