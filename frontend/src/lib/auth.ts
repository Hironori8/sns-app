import api from './api';
import { AuthResponse, User } from '../types';

export const authApi = {
  // ログイン
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      identifier,
      password,
    });
    return response.data;
  },

  // ユーザー登録
  async register(username: string, displayName: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      username,
      displayName,
      email,
      password,
    });
    return response.data;
  },

  // ログアウト
  async logout(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/logout');
    return response.data;
  },

  // 現在のユーザー情報取得
  async getCurrentUser(): Promise<{ user: User; message: string }> {
    const response = await api.get<{ user: User; message: string }>('/auth/me');
    return response.data;
  },

  // 認証状態確認
  async checkAuth(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    const response = await api.get<{ isAuthenticated: boolean; user: User | null }>('/auth/check');
    return response.data;
  },
};
