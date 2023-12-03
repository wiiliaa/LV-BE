import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiTags } from '@nestjs/swagger';
import { Comment } from './entities/comment.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentService) {}

  @Get('product/:productId')
  async getAllCommentsForProduct(@Param('productId') productId: number) {
    const comments = await this.commentsService.getAllCommentsForProduct(
      productId,
    );
    return comments;
  }

  @Post(':productId')
  async createComment(
    @GetUser() user: User,
    @Param('productId') productId: number,
    @Body('rate') rate: number,
  ) {
    const comment = await this.commentsService.createComment(
      user,
      productId,
      rate,
    );
    return comment;
  }
}
