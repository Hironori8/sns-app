import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  checkingAuth: boolean;

  // ログイン
  login: (identifier: string, password: string) => Promise<User | null>;
  // 登録
  register: (username: string, displayName: string, email: string, password: string) => Promise<User | null>;
  // ログアウト
  logout: () => Promise<void>;
  // 認証状態チェック
  checkAuth: () => Promise<boolean>;
  // クリア
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  checkingAuth: true,

  login: async (identifier: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login(identifier, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error: any) {
      set({ 
        error: error.message || 'ログインに失敗しました', 
        isLoading: false, 
        isAuthenticated: false 
      });
      return null;
    }
  },

  register: async (username: string, displayName: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register(username, displayName, email, password);
      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error: any) {
      set({ 
        error: error.message || 'ユーザー登録に失敗しました', 
        isLoading: false,
        isAuthenticated: false 
      });
      return null;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'ログアウトに失敗しました', 
        isLoading: false 
      });
    }
  },

  checkAuth: async () => {
    // すでに認証済みで、ユーザーデータがある場合は再取得しない
    if (get().isAuthenticated && get().user) {
      set({ checkingAuth: false });
      return true;
    }

    set({ checkingAuth: true, error: null });
    try {
      console.log('認証状態をAPIで確認中...');
      const { isAuthenticated, user } = await authApi.checkAuth();
      
      console.log('認証結果:', { isAuthenticated, user });
      
      set({ 
        isAuthenticated, 
        user, 
        checkingAuth: false 
      });
      return isAuthenticated;
    } catch (error: any) {
      console.error('認証確認エラー:', error);
      set({ 
        isAuthenticated: false, 
        user: null, 
        checkingAuth: false,
        error: error.message || '認証状態の確認に失敗しました'
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
