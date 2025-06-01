import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../auth/decorators';

@Controller('posts/:postId/likes')
@UseGuards(JwtAuthGuard)
export class LikesController {
  constructor(private likesService: LikesService) {}

  // いいね追加
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: any,
  ) {
    return await this.likesService.likePost(postId, user.id);
  }

  // いいね削除
  @Delete()
  @HttpCode(HttpStatus.OK)
  async unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: any,
  ) {
    return await this.likesService.unlikePost(postId, user.id);
  }

  // いいね状態確認
  @Get('status')
  async getLikeStatus(
    @Param('postId', ParseIntPipe) postId: number,
    @CurrentUser() user: any,
  ) {
    const status = await this.likesService.getLikeStatus(postId, user.id);
    return {
      postId,
      ...status,
    };
  }

  // いいね一覧取得
  @Public()
  @Get()
  async getPostLikes(
    @Param('postId', ParseIntPipe) postId: number,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('pageSize', ParseIntPipe) pageSize: number = 20,
  ) {
    return await this.likesService.getPostLikes(postId, page, pageSize);
  }
}