import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductService } from 'src/product/product.service';
import { UserService } from 'src/user/user.service';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getAllCommentsForProduct(productId: number): Promise<Comment[]> {
    return this.commentRepository.find({ where: { product_id: productId } });
  }

  // Các phương thức khác nếu cần
}
