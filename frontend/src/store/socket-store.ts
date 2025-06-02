import { create } from 'zustand';
import { 
  connectSocket, 
  disconnectSocket, 
  emitGetOnlineUsers,
  initSocket,
  onOnlineUsers,
  onPostLiked,
  onPostUnliked,
  onTypingStart,
  onTypingStop,
  onUserConnected,
  onUserDisconnected,
  onCommentCreated,
  onCommentDeleted
} from '../lib/socket';
import { 
  OnlineUser, 
  OnlineUsersData, 
  PostLikedData, 
  TypingData, 
  CommentData, 
  CommentDeletedData 
} from '../types';
import { usePostsStore } from './posts-store';

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
  updatePostLikeStatus: (data: PostLikedData) => void;
  updatePostComments: (data: CommentData) => void;
  removePostComment: (data: CommentDeletedData) => void;
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
      
      // 再接続ロジックの設定
      socket.on('connect', () => {
        console.log('Socket connected successfully');
        set({ isConnected: true, error: null });
        // 接続時に初期データ取得
        emitGetOnlineUsers();
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        set({ isConnected: false });
        
        // 5秒後に再接続を試みる
        setTimeout(() => {
          if (!socket.connected) {
            console.log('Attempting to reconnect...');
            socket.connect();
          }
        }, 5000);
      });
      
      // オンラインユーザーリスナー設定
      onOnlineUsers((data) => get().setOnlineUsers(data));
      
      // タイピングリスナー設定
      onTypingStart((data) => get().addTypingUser(data));
      onTypingStop((data) => get().removeTypingUser(data));
      
      // ユーザー接続/切断リスナー
      onUserConnected(() => emitGetOnlineUsers());
      onUserDisconnected(() => emitGetOnlineUsers());
      
      // いいね関連のリスナー設定
      onPostLiked((data) => {
        console.log('Post liked event received:', data);
        get().updatePostLikeStatus(data);
      });
      onPostUnliked((data) => {
        console.log('Post unliked event received:', data);
        get().updatePostLikeStatus(data);
      });
      
      // コメント関連のリスナー設定
      onCommentCreated((data) => {
        console.log('Comment created event received:', data);
        get().updatePostComments(data);
      });
      onCommentDeleted((data) => {
        console.log('Comment deleted event received:', data);
        get().removePostComment(data);
      });
      
      // 接続開始
      connectSocket();
      
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
  
  updatePostLikeStatus: (data) => {
    // posts-storeからメソッドを呼び出してリアルタイム更新
    const postsStore = usePostsStore.getState();
    const { posts } = postsStore;
    
    // 対象の投稿が現在表示されている投稿リストに含まれる場合のみ更新
    const post = posts.find(p => p.id === data.postId);
    if (post) {
      // いいね状態を更新（投稿ストア内の投稿データを更新）
      postsStore.updatePostLikeStatus(data.postId, data.isLiked, data.likeCount);
    }
  },
  
  updatePostComments: (data) => {
    // posts-storeからメソッドを呼び出してリアルタイム更新
    const postsStore = usePostsStore.getState();
    const { posts } = postsStore;
    
    // 対象の投稿が現在表示されている投稿リストに含まれる場合のみ更新
    const post = posts.find(p => p.id === data.postId);
    if (post) {
      console.log(`Updating comments for post ${data.postId}`);
      
      // posts-storeにコメント更新メソッドがある場合は呼び出す
      if (typeof postsStore.addComment === 'function') {
        postsStore.addComment(data);
      } else {
        console.warn('Post store does not have addComment method');
      }
    }
  },
  
  removePostComment: (data) => {
    // posts-storeからメソッドを呼び出してリアルタイム更新
    const postsStore = usePostsStore.getState();
    const { posts } = postsStore;
    
    // 対象の投稿が現在表示されている投稿リストに含まれる場合のみ更新
    const post = posts.find(p => p.id === data.postId);
    if (post) {
      console.log(`Removing comment ${data.id} from post ${data.postId}`);
      
      // posts-storeにコメント削除メソッドがある場合は呼び出す
      if (typeof postsStore.removeComment === 'function') {
        postsStore.removeComment(data.postId, data.id);
      } else {
        console.warn('Post store does not have removeComment method');
      }
    }
  },
  
  setError: (error) => set({ error }),
  
  getOnlineUsers: () => {
    if (get().isConnected) {
      emitGetOnlineUsers();
    }
  },
}));
