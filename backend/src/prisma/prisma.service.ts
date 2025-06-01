import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    console.log('✅ Connected to SQLite database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    console.log('❌ Disconnected from SQLite database');
  }

  // 投稿をいいね数付きで取得
  async getPostsWithLikeCounts(take?: number, skip?: number) {
    return this.post.findMany({
      take,
      skip,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 特定ユーザーがいいねした投稿かチェック
  async getPostsWithUserLikes(userId: number, take?: number, skip?: number) {
    return this.post.findMany({
      take,
      skip,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        likes: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // 投稿総数を取得
  async getPostsCount(): Promise<number> {
    return this.post.count();
  }

  // ユーザーの投稿数を取得
  async getUserPostsCount(userId: number): Promise<number> {
    return this.post.count({
      where: {
        authorId: userId,
      },
    });
  }

  // いいねの存在確認
  async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
    const like = await this.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return Boolean(like);
  }
}