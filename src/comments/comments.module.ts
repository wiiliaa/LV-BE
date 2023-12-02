import { Module } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';

@Module({
  controllers: [CommentsController],
  providers: [CommentService],
  imports: [TypeOrmModule.forFeature([Comment]), Order, Product, User],
})
export class CommentsModule {}
