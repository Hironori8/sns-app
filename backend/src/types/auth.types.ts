// backend/src/types/auth.types.ts (修正版)
export interface JwtPayload {
  sub: number; // ユーザーID
  username: string;
  email: string; // ← この行を追加
  iat?: number; // 発行時間
  exp?: number; // 有効期限
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    displayName: string;
    email: string;
    createdAt: Date;
  };
  message: string;
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}