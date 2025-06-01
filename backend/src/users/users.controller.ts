import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { LikesService } from '../likes/likes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private likesService: LikesService) {}

  // ユーザーのいいね数取得
  @Public()
  @Get(':userId/likes/count')
  async getUserLikeCount(@Param('userId', ParseIntPipe) userId: number) {
    const count = await this.likesService.getUserLikeCount(userId);
    return {
      userId,
      likeCount: count,
    };
  }
}