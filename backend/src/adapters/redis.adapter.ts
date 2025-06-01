import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private configService: ConfigService) {
    super();
  }

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({
      socket: {
        host: this.configService.get('REDIS_HOST') || 'localhost',
        port: parseInt(this.configService.get('REDIS_PORT') || '6379'),
      },
    });

    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);

    console.log('✅ Redis adapter connected successfully');
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}

// backend/src/websocket/dto/websocket.dto.ts
export interface PostCreatedData {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    displayName: string;
  };
  createdAt: Date;
  likeCount: number;
}

export interface PostLikedData {
  postId: number;
  userId: number;
  likeCount: number;
  isLiked: boolean;
}

export interface UserConnectedData {
  userId: number;
  username: string;
  displayName: string;
}

export interface OnlineUsersData {
  users: Array<{
    userId: number;
    username: string;
    displayName: string;
  }>;
  count: number;
}

export interface TypingData {
  userId: number;
  username: string;
  isTyping: boolean;
}