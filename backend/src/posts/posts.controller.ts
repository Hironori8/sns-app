// backend/src/posts/posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto, PostQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, Public } from '../auth/decorators';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  // 投稿作成
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() user: any,
  ) {
    const post = await this.postsService.createPost(createPostDto, user.id);
    return {
      post,
      message: '投稿を作成しました',
    };
  }

  // 投稿一覧取得（タイムライン）
  @Public()
  @Get()
  async findPosts(
    @Query() query: PostQueryDto,
    @CurrentUser() user?: any,
  ) {
    const currentUserId = user?.id;
    return await this.postsService.findPosts(query, currentUserId);
  }

  // 投稿詳細取得
  @Public()
  @Get(':id')
  async findPostById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: any,
  ) {
    const currentUserId = user?.id;
    const post = await this.postsService.findPostById(id, currentUserId);
    return {
      post,
      message: '投稿を取得しました',
    };
  }

  // 投稿削除
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deletePost(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    await this.postsService.deletePost(id, user.id);
    return {
      message: '投稿を削除しました',
    };
  }

  // ユーザー別投稿一覧
  @Public()
  @Get('user/:userId')
  async findUserPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: PostQueryDto,
    @CurrentUser() user?: any,
  ) {
    const currentUserId = user?.id;
    const queryWithUserId = { ...query, userId };
    return await this.postsService.findPosts(queryWithUserId, currentUserId);
  }

  // ユーザー投稿数取得
  @Public()
  @Get('user/:userId/count')
  async getUserPostCount(@Param('userId', ParseIntPipe) userId: number) {
    const count = await this.postsService.getUserPostCount(userId);
    return {
      userId,
      postCount: count,
    };
  }
}