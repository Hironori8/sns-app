import { create } from 'zustand';
import { Post } from '../types';
import { postsApi } from '../lib/posts';
import { likesApi } from '../lib/likes';

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  totalCount: number;

  // 投稿取得
  fetchPosts: (page?: number, reset?: boolean) => Promise<void>;
  fetchUserPosts: (userId: number, page?: number, reset?: boolean) => Promise<void>;
  
  // 投稿作成
  createPost: (content: string) => Promise<Post | null>;
  
  // 投稿削除
  deletePost: (id: number) => Promise<boolean>;
  
  // 「いいね」操作
  likePost: (postId: number) => Promise<boolean>;
  unlikePost: (postId: number) => Promise<boolean>;
  updatePostLikeStatus: (postId: number, isLiked: boolean, likeCount: number) => void;
  
  // リセット
  resetPosts: () => void;
  clearError: () => void;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  page: 1,
  hasMore: true,
  totalCount: 0,

  // タイムライン投稿取得
  fetchPosts: async (page = 1, reset = false) => {
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const { posts, totalCount, hasMore, page: returnedPage } = 
        await postsApi.getPosts({ page, pageSize: 10 });
      
      set(state => ({
        posts: reset ? posts : [...state.posts, ...posts],
        isLoading: false,
        totalCount,
        hasMore,
        page: returnedPage,
        error: null
      }));
    } catch (error: any) {
      set({ 
        error: error.message || '投稿の取得に失敗しました', 
        isLoading: false 
      });
    }
  },

  // ユーザー投稿取得
  fetchUserPosts: async (userId: number, page = 1, reset = false) => {
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const { posts, totalCount, hasMore, page: returnedPage } = 
        await postsApi.getUserPosts(userId, { page, pageSize: 10 });
      
      set(state => ({
        posts: reset ? posts : [...state.posts, ...posts],
        isLoading: false,
        totalCount,
        hasMore,
        page: returnedPage,
        error: null
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'ユーザー投稿の取得に失敗しました', 
        isLoading: false 
      });
    }
  },

  // 投稿作成
  createPost: async (content: string) => {
    set({ isLoading: true, error: null });
    try {
      const { post } = await postsApi.createPost(content);
      
      // 投稿リストの先頭に追加
      set(state => ({
        posts: [post, ...state.posts],
        isLoading: false,
        totalCount: state.totalCount + 1,
      }));
      
      return post;
    } catch (error: any) {
      set({ 
        error: error.message || '投稿の作成に失敗しました', 
        isLoading: false 
      });
      return null;
    }
  },

  // 投稿削除
  deletePost: async (id: number) => {
    try {
      await postsApi.deletePost(id);
      
      // 投稿リストから削除
      set(state => ({
        posts: state.posts.filter(post => post.id !== id),
        totalCount: state.totalCount - 1,
      }));
      
      return true;
    } catch (error: any) {
      set({ error: error.message || '投稿の削除に失敗しました' });
      return false;
    }
  },

  // いいね追加
  likePost: async (postId: number) => {
    try {
      const { isLiked, likeCount } = await likesApi.likePost(postId);
      
      // 投稿リスト内のいいね状態を更新
      set(state => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, isLiked, likeCount } 
            : post
        ),
      }));
      
      return true;
    } catch (error: any) {
      set({ error: error.message || 'いいねに失敗しました' });
      return false;
    }
  },

  // いいね削除
  unlikePost: async (postId: number) => {
    try {
      const { isLiked, likeCount } = await likesApi.unlikePost(postId);
      
      // 投稿リスト内のいいね状態を更新
      set(state => ({
        posts: state.posts.map(post => 
          post.id === postId 
            ? { ...post, isLiked, likeCount } 
            : post
        ),
      }));
      
      return true;
    } catch (error: any) {
      set({ error: error.message || 'いいねの取り消しに失敗しました' });
      return false;
    }
  },

  // WebSocket経由でのいいね状態更新
  updatePostLikeStatus: (postId: number, isLiked: boolean, likeCount: number) => {
    // デバッグログ
    console.log(`Updating post ${postId} like status: isLiked=${isLiked}, count=${likeCount}`);
    
    const postsWithTarget = get().posts.some(post => post.id === postId);
    if (!postsWithTarget) {
      console.log(`Post ${postId} not found in current state, skipping update`);
      return;
    }
    
    set(state => ({
      posts: state.posts.map(post => {
        if (post.id === postId) {
          console.log(`Updating post in state: ${post.id}`);
          return { ...post, isLiked, likeCount };
        }
        return post;
      }),
    }));
  },

  // 投稿リストをリセット
  resetPosts: () => {
    set({
      posts: [],
      page: 1,
      hasMore: true,
      totalCount: 0,
    });
  },

  clearError: () => set({ error: null }),
}));
