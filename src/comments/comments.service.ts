import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async createComment(commentData: CreateCommentDto): Promise<Comment> {
    const comment = this.commentRepository.create(commentData);
    return await this.commentRepository.save(comment);
  }
  async findAllComments(): Promise<Comment[]> {
    return this.commentRepository.find();
  }
  async getCommentById(id: number) {
    return await this.commentRepository.findOne({ where: { id } });
  }

  async update(
    commentId: number,
    updatedData: UpdateCommentDto,
  ): Promise<Comment | undefined> {
    await this.commentRepository.update(commentId, updatedData);
    return this.getCommentById(commentId);
  }

  async delete(commentId: number): Promise<void> {
    await this.commentRepository.delete(commentId);
  }
}
