import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

import { User } from 'src/user/entities/user.entity';

import { OrderService } from 'src/order/order.service';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private orderService: OrderService,
  ) {}

  async createComment(
    user: User,
    productId: number,
    rate: number,
  ): Promise<Comment> {
    // Kiểm tra xem người dùng đã mua sản phẩm chưa
    const userHasPurchased = await this.hasUserPurchasedProduct(
      user.id,
      productId,
    );

    if (!userHasPurchased) {
      throw new NotFoundException('Bạn phải mua sản phẩm trước khi đánh giá');
    }

    // Tạo đánh giá
    const comment = new Comment();
    comment.user = user;
    comment.product_id = productId; // Assuming productId is the correct field
    comment.rate = rate;

    return await this.commentRepository.save(comment);
  }

  async hasUserPurchasedProduct(
    id: number,
    productId: number,
  ): Promise<boolean> {
    // Lấy tất cả các đơn hàng của người dùng
    const orders = await this.orderService.findAllOrdersForUser(id);

    // Kiểm tra xem có đơn hàng nào chứa sản phẩm hay không
    for (const order of orders) {
      const orderItem = order.order_items.find(
        (item) => item.version.product.id === productId,
      );
      if (orderItem) {
        return true; // Người dùng đã mua sản phẩm trong ít nhất một đơn hàng
      }
    }

    return false; // Người dùng chưa mua sản phẩm
  }

  async getAllCommentsForProduct(productId: number): Promise<Comment[]> {
    try {
      const comments = await this.commentRepository.find({
        where: { product_id: productId },
        relations: ['user'], // If you want to include user details in comments
      });

      return comments;
    } catch (error) {
      console.error('Error retrieving comments:', error);
      throw new NotFoundException('Error retrieving comments');
    }
  }
}
