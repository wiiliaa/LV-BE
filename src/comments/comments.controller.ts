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
import { CommentsService } from './comments.service';
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
  constructor(private readonly commentsService: CommentsService) {}

  @Get('/user/:userId')
  async findCommentsByUser(
    @Param('userId') userId: number,
  ): Promise<Comment[]> {
    const commentsByUser: Comment[] =
      await this.commentsService.findCommentsByUser(userId);
    return commentsByUser;
  }

  @Get('/product/:productId')
  async findCommentsByProduct(
    @Param('productId') productId: number,
  ): Promise<Comment[]> {
    const commentsByProduct: Comment[] =
      await this.commentsService.findCommentsByProduct(productId);
    return commentsByProduct;
  }

  // @Post()
  // @UseGuards(AuthGuard('jwt'))
  // async createComment(
  //   @GetUser() user: User,
  //   @Body() createCommentDto: CreateCommentDto,
  // ): Promise<Comment> {
  //   return await this.commentsService.createComment(user, createCommentDto);
  // }

  @Put('/updateComment/:id')
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<Comment> {
    const updatedComment: Comment = await this.commentsService.updateComment(
      commentId,
      updateCommentDto,
    );
    return updatedComment;
  }

  @Delete(':id')
  async deleteComment(@Param('id') commentId: number): Promise<void> {
    await this.commentsService.deleteComment(commentId);
  }
}
