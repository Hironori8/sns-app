import { io, Socket } from 'socket.io-client';
import { OnlineUsersData, TypingData, PostLikedData, CommentData, CommentDeletedData } from '../types';

let socket: Socket | null = null;

export const initSocket = (): Socket => {
  if (socket) return socket;
  
  // Socket.IOクライアントの初期化
  const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
  
  socket = io(`${baseUrl}/sns`, {
    withCredentials: true, // Cookieを送信する設定
    autoConnect: false, // 手動で接続する
    transports: ['websocket', 'polling'] // WebSocketとポーリングの両方を許可
  });
  
  // 接続エラーハンドリング
  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });
  
  return socket;
};

// Socket.IOイベントリスナー追加関数
export const onUserConnected = (callback: (user: { userId: number; username: string; displayName: string }) => void) => {
  if (!socket) return () => {};
  socket.on('user:connected', callback);
  return () => socket?.off('user:connected', callback);
};

export const onUserDisconnected = (callback: (user: { userId: number; username: string; displayName: string }) => void) => {
  if (!socket) return () => {};
  socket.on('user:disconnected', callback);
  return () => socket?.off('user:disconnected', callback);
};

export const onOnlineUsers = (callback: (data: OnlineUsersData) => void) => {
  if (!socket) return () => {};
  socket.on('users:online', callback);
  return () => socket?.off('users:online', callback);
};

export const onTypingStart = (callback: (data: TypingData) => void) => {
  if (!socket) return () => {};
  socket.on('typing:start', callback);
  return () => socket?.off('typing:start', callback);
};

export const onTypingStop = (callback: (data: TypingData) => void) => {
  if (!socket) return () => {};
  socket.on('typing:stop', callback);
  return () => socket?.off('typing:stop', callback);
};

// いいね関連のリスナー
export const onPostLiked = (callback: (data: PostLikedData) => void) => {
  if (!socket) return () => {};
  socket.on('post:liked', callback);
  return () => socket?.off('post:liked', callback);
};

export const onPostUnliked = (callback: (data: PostLikedData) => void) => {
  if (!socket) return () => {};
  socket.on('post:unliked', callback);
  return () => socket?.off('post:unliked', callback);
};

// コメント関連のリスナー
export const onCommentCreated = (callback: (data: CommentData) => void) => {
  if (!socket) return () => {};
  socket.on('comment:created', callback);
  return () => socket?.off('comment:created', callback);
};

export const onCommentDeleted = (callback: (data: CommentDeletedData) => void) => {
  if (!socket) return () => {};
  socket.on('comment:deleted', callback);
  return () => socket?.off('comment:deleted', callback);
};

// Socket.IOエミッター関数
export const emitTypingStart = () => {
  socket?.emit('typing:start');
};

export const emitTypingStop = () => {
  socket?.emit('typing:stop');
};

export const emitGetOnlineUsers = () => {
  socket?.emit('users:get-online');
};

// 接続と切断
export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

// 無効化
export const destroySocket = () => {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
};
