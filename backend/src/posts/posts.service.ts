// backend/src/posts/posts.service.ts
import { Injectable, NotFoundException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, PostQueryDto } from './dto';
import { PostWithAuthor, PaginatedPostsResponse } from '../types/post.types';
import { WebSocketNotificationService } from '../websocket/websocket.notification.service';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: WebSocketNotificationService,
    ) {}

  // 投稿作成
  async createPost(createPostDto: CreatePostDto, authorId: number): Promise<PostWithAuthor> {
    const { content } = createPostDto;

    const post = await this.prisma.post.create({
      data: {
        content,
        authorId,
      },
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
    });

    const postWithAuthor: PostWithAuthor = {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      likeCount: post._count.likes,
    };

    // WebSocket通知: 新規投稿をリアルタイムで通知
    this.notificationService.notifyPostCreated({
      id: post.id,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt,
      likeCount: post._count.likes,
    });

    return postWithAuthor
  }

  // 投稿一覧取得（タイムライン）
  async findPosts(query: PostQueryDto, currentUserId?: number): Promise<PaginatedPostsResponse> {
    const { page = 1, pageSize = 20, search, userId } = query;
    const skip = (page - 1) * pageSize;

    // 検索条件構築
    const where: any = {};

    if (search) {
      where.content = {
        contains: search,
      };
    }

    if (userId) {
      where.authorId = userId;
    }

    // 投稿総数取得
    const total = await this.prisma.post.count({ where });

    // 投稿取得
    const posts = await this.prisma.post.findMany({
      where,
      take: pageSize,
      skip,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        likes: currentUserId ? {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        } : false,
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

    // レスポンス整形
    const formattedPosts: PostWithAuthor[] = posts.map(post => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      likeCount: post._count.likes,
      isLikedByCurrentUser: currentUserId ? (Array.isArray(post.likes) && post.likes.length > 0) : undefined,
    }));

    return {
      posts: formattedPosts,
      pagination: {
        total,
        page,
        pageSize,
        hasNext: skip + pageSize < total,
        hasPrev: page > 1,
      },
    };
  }

  // 投稿詳細取得
  async findPostById(id: number, currentUserId?: number): Promise<PostWithAuthor> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        likes: currentUserId ? {
          where: {
            userId: currentUserId,
          },
          select: {
            id: true,
          },
        } : false,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }

    return {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      likeCount: post._count.likes,
      isLikedByCurrentUser: currentUserId ? (Array.isArray(post.likes) && post.likes.length > 0) : undefined,
    };
  }

  // 投稿削除
  async deletePost(id: number, userId: number): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!post) {
      throw new NotFoundException('投稿が見つかりません');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('自分の投稿のみ削除できます');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    // WebSocket通知: 投稿削除をリアルタイムで通知
    this.notificationService.notifyPostDeleted({
      id: post.id,
      authorId: post.authorId,
    });
  }

  // ユーザー別投稿数取得
  async getUserPostCount(userId: number): Promise<number> {
    return this.prisma.post.count({
      where: {
        authorId: userId,
      },
    });
  }

  // 投稿存在確認
  async postExists(id: number): Promise<boolean> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!post;
  }
}