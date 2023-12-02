import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { User } from 'src/user/entities/user.entity';
import { Order } from 'src/order/entities/order.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async findCommentsByUser(userId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { user_id: userId },
    });
    return comments || [];
  }

  async findCommentsByProduct(productId: number): Promise<Comment[]> {
    const comments = await this.commentRepository.find({
      where: { product_id: productId },
    });
    return comments || [];
  }

  // async createComment(
  //   user: User,
  //   createCommentDto: CreateCommentDto,
  // ): Promise<Comment> {
  //   const { text, rate, product_id } = createCommentDto;

  //   // Check if the user has purchased the product
  //   const hasPurchasedProduct = await this.hasPurchasedProduct(
  //     user.id,
  //     product_id,
  //   );

  //   if (!hasPurchasedProduct) {
  //     throw new UnauthorizedException(
  //       'You can only comment on products you have purchased.',
  //     );
  //   }

  //   const comment = this.commentRepository.create({
  //     text,
  //     rate,
  //     user_id: user.id,
  //     product_id,
  //   });

  //   return this.commentRepository.save(comment);
  // }

  // private async hasPurchasedProduct(
  //   userId: number,
  //   productId: number,
  // ): Promise<boolean> {
  //   const userOrders = await this.orderRepository.find({
  //     where: { user_id: userId },
  //   });
  //   for (const order of userOrders) {
  //     const hasProduct = order.order_items.some(
  //       (item) => item.product_id === productId,
  //     );
  //     if (hasProduct) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }

  async updateComment(
    id: number,
    updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    try {
      const { rate } = updateCommentDto;

      const comment = await this.commentRepository.findOne({ where: { id } });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      comment.rate = rate;

      return this.commentRepository.save(comment);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async deleteComment(id: number): Promise<void> {
    try {
      const comment = await this.commentRepository.findOne({ where: { id } });
      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      await this.commentRepository.remove(comment);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
