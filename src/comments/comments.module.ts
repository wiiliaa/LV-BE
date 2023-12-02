import { Module } from '@nestjs/common';
import { CommentService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from './entities/comment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { OrderModule } from 'src/order/order.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentService],
  imports: [TypeOrmModule.forFeature([Comment]), OrderModule],
})
export class CommentsModule {}
