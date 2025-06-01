import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { WebSocketService } from './websocket.service';
import { JwtPayload } from '../types/auth.types';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface PostCreatedData {
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

interface PostLikedData {
  postId: number;
  userId: number;
  username: string;
  likeCount: number;
  isLiked: boolean;
}

interface TypingData {
  userId: number;
  username: string;
  displayName: string;
  isTyping: boolean;
}

// Socket.IOクライアントへの型拡張
interface AuthenticatedSocket extends Socket {
  user?: {
    id: number;
    username: string;
    displayName: string;
    email: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'], // Next.jsのURL
    credentials: true,
  },
  namespace: 'sns',
})
export class WebsocketGatewayService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGatewayService.name);

  constructor(
    private authService: AuthService,
    private websocketService: WebSocketService,
    private configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Cookieから認証トークンを取得
      const token = this.extractTokenFromCookie(client.handshake.headers.cookie);

      if (!token) {
        this.logger.warn(`Connection rejected: No auth token from ${client.id}`);
        client.disconnect();
        return;
      }

      // JWTトークンを検証
      const result = this.configService.get<string>('JWT_SECRET');
      if (!result) {
        throw new Error('JWT_SECRET is not configured');
      }
      const decoded = jwt.verify(token, result) as unknown as JwtPayload;
      const user = await this.authService.validateJwtPayload(decoded);

      if (!user) {
        this.logger.warn(`Connection rejected: Invalid user from ${client.id}`);
        client.disconnect();
        return;
      }

      // クライアントにユーザー情報を添付
      client.user = user;

      // オンラインユーザーに追加
      await this.websocketService.addOnlineUser(user);

      // クライアントをメインルームに参加
      await client.join('main');

      // 接続成功をログ
      this.logger.log(`User connected: ${user.username} (${client.id})`);

      // 他のクライアントに新規接続を通知
      client.broadcast.emit('user:connected', {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        connectedAt: new Date(),
      });

      // 現在のオンラインユーザー一覧を送信
      const onlineUsers = await this.websocketService.getOnlineUsers();
      this.server.emit('users:online', onlineUsers);

    } catch (error) {
      this.logger.error(`Connection error for ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      // オンラインユーザーから削除
      await this.websocketService.removeOnlineUser(client.user.id);

      this.logger.log(`User disconnected: ${client.user.username} (${client.id})`);

      // 他のクライアントに切断を通知
      client.broadcast.emit('user:disconnected', {
        userId: client.user.id,
        username: client.user.username,
        displayName: client.user.displayName,
      });

      // 更新されたオンラインユーザー一覧を送信
      const onlineUsers = await this.websocketService.getOnlineUsers();
      this.server.emit('users:online', onlineUsers);
    }
  }

  @SubscribeMessage('typing:start')
  handleTypingStart(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.user) {
      const typingData: TypingData = {
        userId: client.user.id,
        username: client.user.username,
        displayName: client.user.displayName,
        isTyping: true,
      };
      client.broadcast.emit('typing:start', typingData);
    }
  }

  @SubscribeMessage('typing:stop')
  handleTypingStop(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.user) {
      const typingData: TypingData = {
        userId: client.user.id,
        username: client.user.username,
        displayName: client.user.displayName,
        isTyping: false,
      };
      client.broadcast.emit('typing:stop', typingData);
    }
  }

  @SubscribeMessage('users:get-online')
  async handleGetOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUsers = await this.websocketService.getOnlineUsers();
    client.emit('users:online', onlineUsers);
  }

  private extractTokenFromCookie(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    return cookies.access_token || null;
  }
}
