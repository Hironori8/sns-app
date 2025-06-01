// backend/src/likes/likes.service.ts
import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LikeResponse } from '../types/post.types';
import { WebSocketNotificationService } from '../websocket/websocket.notification.service';

@Injectable()
export class LikesService {
  constructor(
    private prisma: PrismaService,
    private notificationService: WebSocketNotificationService
  ) {}

  // いいね追加
  async likePost(postId: number, userId: number): Promise<LikeResponse> {
    // 投稿存在確認
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }

    // 既にいいねしているかチェック
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      throw new ConflictException('既にいいねしています');
    }

    // ユーザー情報取得
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    // いいね追加
    await this.prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    // いいね数取得
    const likeCount = await this.getLikeCount(postId);

    // WebSocket通知: いいね追加をリアルタイムで通知
    if (user) {
      this.notificationService.notifyPostLiked({
        postId,
        userId,
        username: user.username,
        likeCount,
        isLiked: true,
      });
    }

    return {
      id: postId,
      isLiked: true,
      likeCount,
      message: 'いいねしました',
    };
  }

  // いいね削除
  async unlikePost(postId: number, userId: number): Promise<LikeResponse> {
    // 投稿存在確認
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }

    // いいね存在確認
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('いいねが見つかりません');
    }

    // ユーザー情報取得
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
    });

    // いいね削除
    await this.prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // いいね数取得
    const likeCount = await this.getLikeCount(postId);

    // WebSocket通知: いいね削除をリアルタイムで通知
    if (user) {
      this.notificationService.notifyPostUnliked({
        postId,
        userId,
        username: user.username,
        likeCount,
        isLiked: false,
      });
    }

    return {
      id: postId,
      isLiked: false,
      likeCount,
      message: 'いいねを取り消しました',
    };
  }

  // いいね状態確認
  async getLikeStatus(postId: number, userId: number): Promise<{ isLiked: boolean; likeCount: number }> {
    // 投稿存在確認
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }

    // いいね状態確認
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // いいね数取得
    const likeCount = await this.getLikeCount(postId);

    return {
      isLiked: !!like,
      likeCount,
    };
  }

  // いいね一覧取得
  async getPostLikes(postId: number, page: number = 1, pageSize: number = 20) {
    // 投稿存在確認
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }

    const skip = (page - 1) * pageSize;

    // いいね一覧取得
    const likes = await this.prisma.like.findMany({
      where: { postId },
      take: pageSize,
      skip,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 総数取得
    const total = await this.prisma.like.count({
      where: { postId },
    });

    return {
      likes: likes.map(like => ({
        id: like.id,
        user: like.user,
        createdAt: like.createdAt,
      })),
      pagination: {
        total,
        page,
        pageSize,
        hasNext: skip + pageSize < total,
        hasPrev: page > 1,
      },
    };
  }

  // いいね数取得（プライベートメソッド）
  private async getLikeCount(postId: number): Promise<number> {
    return this.prisma.like.count({
      where: { postId },
    });
  }

  // ユーザーがいいねした投稿数取得
  async getUserLikeCount(userId: number): Promise<number> {
    return this.prisma.like.count({
      where: { userId },
    });
  }
}