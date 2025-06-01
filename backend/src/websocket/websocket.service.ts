// backend/src/websocket/websocket.service.ts
import { Injectable } from '@nestjs/common';
import { OnlineUsersData } from './dto';

@Injectable()
export class WebSocketService {
  // オンラインユーザーを管理するMap（本格運用時はRedisに移行）
  private onlineUsers = new Map<number, {
    id: number;
    username: string;
    displayName: string;
    connectedAt: Date;
  }>();

  // オンラインユーザーを追加
  async addOnlineUser(user: {
    id: number;
    username: string;
    displayName: string;
  }): Promise<void> {
    this.onlineUsers.set(user.id, {
      ...user,
      connectedAt: new Date(),
    });
  }

  // オンラインユーザーを削除
  async removeOnlineUser(userId: number): Promise<void> {
    this.onlineUsers.delete(userId);
  }

  // オンラインユーザー一覧を取得
  async getOnlineUsers(): Promise<OnlineUsersData> {
    const users = Array.from(this.onlineUsers.values()).map(user => ({
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
    }));

    return {
      users,
      count: users.length,
    };
  }

  // 特定ユーザーがオンラインかチェック
  async isUserOnline(userId: number): Promise<boolean> {
    return this.onlineUsers.has(userId);
  }

  // オンラインユーザー数を取得
  async getOnlineUserCount(): Promise<number> {
    return this.onlineUsers.size;
  }

  // 特定ユーザーの接続時間を取得
  async getUserConnectionTime(userId: number): Promise<Date | null> {
    const user = this.onlineUsers.get(userId);
    return user?.connectedAt || null;
  }
}