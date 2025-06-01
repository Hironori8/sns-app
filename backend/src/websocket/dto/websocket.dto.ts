import { IsNotEmpty, IsNumber, IsString, IsBoolean, IsOptional } from 'class-validator';

// 投稿作成時のデータ型
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

// 投稿削除時のデータ型
export interface PostDeletedData {
  id: number;
  authorId: number;
}

// いいね操作時のデータ型
export interface PostLikedData {
  postId: number;
  userId: number;
  username: string;
  likeCount: number;
  isLiked: boolean;
}

// ユーザー接続時のデータ型
export interface UserConnectedData {
  userId: number;
  username: string;
  displayName: string;
  connectedAt: Date;
}

// ユーザー切断時のデータ型
export interface UserDisconnectedData {
  userId: number;
  username: string;
  displayName: string;
}

// オンラインユーザー一覧のデータ型
export interface OnlineUsersData {
  users: Array<{
    userId: number;
    username: string;
    displayName: string;
  }>;
  count: number;
}

// タイピングインジケーターのデータ型
export interface TypingData {
  userId: number;
  username: string;
  displayName: string;
  isTyping: boolean;
}

// WebSocketリクエストDTO（クライアント → サーバー）
export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  room: string;
}

export class LeaveRoomDto {
  @IsString()
  @IsNotEmpty()
  room: string;
}

export class TypingStartDto {
  @IsOptional()
  @IsString()
  content?: string;
}

export class TypingStopDto {
  @IsOptional()
  @IsNumber()
  finalLength?: number;
}

// WebSocketイベントの型定義（型安全性のため）
export interface ServerToClientEvents {
  'post:created': (data: PostCreatedData) => void;
  'post:deleted': (data: PostDeletedData) => void;
  'post:liked': (data: PostLikedData) => void;
  'post:unliked': (data: PostLikedData) => void;
  'user:connected': (data: UserConnectedData) => void;
  'user:disconnected': (data: UserDisconnectedData) => void;
  'users:online': (data: OnlineUsersData) => void;
  'typing:start': (data: TypingData) => void;
  'typing:stop': (data: TypingData) => void;
  'error': (data: WebSocketError) => void;
}

export interface ClientToServerEvents {
  'join': (room?: string) => void;
  'leave': (room?: string) => void;
  'typing:start': (data?: TypingStartDto) => void;
  'typing:stop': (data?: TypingStopDto) => void;
  'users:get-online': () => void;
}

// エラーレスポンス型
export interface WebSocketError {
  error: string;
  message: string;
  timestamp: Date;
  code?: string;
}

// 接続状態の型
export interface ConnectionStatus {
  isConnected: boolean;
  userId?: number;
  username?: string;
  connectedAt?: Date;
  lastSeen?: Date;
  reconnectAttempts?: number;
}

// 統計情報の型
export interface WebSocketStats {
  totalConnections: number;
  onlineUsers: number;
  roomsCount: number;
  eventsPerMinute: number;
  uptime: number;
}

// ルーム情報の型
export interface RoomInfo {
  name: string;
  userCount: number;
  users: Array<{
    userId: number;
    username: string;
    joinedAt: Date;
  }>;
}