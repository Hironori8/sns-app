import { create } from 'zustand';
import { 
  connectSocket, 
  disconnectSocket, 
  emitGetOnlineUsers,
  initSocket,
  onOnlineUsers,
  onTypingStart,
  onTypingStop,
  onUserConnected,
  onUserDisconnected
} from '../lib/socket';
import { OnlineUser, OnlineUsersData, TypingData } from '../types';

interface SocketState {
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  onlineCount: number;
  typingUsers: Map<number, TypingData>;
  error: string | null;
  
  // 接続管理
  connect: () => void;
  disconnect: () => void;
  
  // 状態管理
  setConnected: (connected: boolean) => void;
  setOnlineUsers: (data: OnlineUsersData) => void;
  addTypingUser: (data: TypingData) => void;
  removeTypingUser: (data: TypingData) => void;
  setError: (error: string | null) => void;
  
  // リクエスト
  getOnlineUsers: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  isConnected: false,
  onlineUsers: [],
  onlineCount: 0,
  typingUsers: new Map(),
  error: null,
  
  connect: () => {
    try {
      const socket = initSocket();
      
      // オンラインユーザーリスナー設定
      onOnlineUsers((data) => get().setOnlineUsers(data));
      
      // タイピングリスナー設定
      onTypingStart((data) => get().addTypingUser(data));
      onTypingStop((data) => get().removeTypingUser(data));
      
      // ユーザー接続/切断リスナー
      onUserConnected(() => emitGetOnlineUsers());
      onUserDisconnected(() => emitGetOnlineUsers());
      
      // 接続開始
      connectSocket();
      set({ isConnected: true, error: null });
      
      // 初期データ取得
      emitGetOnlineUsers();
    } catch (error: any) {
      set({ error: error.message || 'WebSocketの接続に失敗しました' });
    }
  },
  
  disconnect: () => {
    disconnectSocket();
    set({ isConnected: false, onlineUsers: [], onlineCount: 0, typingUsers: new Map() });
  },
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  setOnlineUsers: (data) => set({ 
    onlineUsers: data.users, 
    onlineCount: data.count 
  }),
  
  addTypingUser: (data) => {
    if (data.isTyping) {
      const newTypingUsers = new Map(get().typingUsers);
      newTypingUsers.set(data.userId, data);
      set({ typingUsers: newTypingUsers });
    }
  },
  
  removeTypingUser: (data) => {
    if (!data.isTyping) {
      const newTypingUsers = new Map(get().typingUsers);
      newTypingUsers.delete(data.userId);
      set({ typingUsers: newTypingUsers });
    }
  },
  
  setError: (error) => set({ error }),
  
  getOnlineUsers: () => {
    if (get().isConnected) {
      emitGetOnlineUsers();
    }
  },
}));
