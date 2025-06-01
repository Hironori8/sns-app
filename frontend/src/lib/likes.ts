import api from './api';
import { User } from '../types';

export const likesApi = {
  // 「いいね」を追加
  async likePost(postId: number): Promise<{ message: string; isLiked: boolean; likeCount: number }> {
    const response = await api.post<{ message: string; isLiked: boolean; likeCount: number }>
      (`/posts/${postId}/likes`);
    return response.data;
  },

  // 「いいね」を削除
  async unlikePost(postId: number): Promise<{ message: string; isLiked: boolean; likeCount: number }> {
    const response = await api.delete<{ message: string; isLiked: boolean; likeCount: number }>
      (`/posts/${postId}/likes`);
    return response.data;
  },

  // 「いいね」状態取得
  async getLikeStatus(postId: number): Promise<{ postId: number; isLiked: boolean; likeCount: number }> {
    const response = await api.get<{ postId: number; isLiked: boolean; likeCount: number }>
      (`/posts/${postId}/likes/status`);
    return response.data;
  },

  // 投稿の「いいね」一覧取得
  async getPostLikes(postId: number, page: number = 1, pageSize: number = 20): 
    Promise<{ likes: Array<{ id: number; createdAt: string; user: User }>; totalCount: number }> {
    const response = await api.get<{ likes: Array<{ id: number; createdAt: string; user: User }>; totalCount: number }>
      (`/posts/${postId}/likes`, { params: { page, pageSize } });
    return response.data;
  },

  // ユーザーの「いいね」数取得
  async getUserLikeCount(userId: number): Promise<{ userId: number; likeCount: number }> {
    const response = await api.get<{ userId: number; likeCount: number }>
      (`/users/${userId}/likes/count`);
    return response.data;
  }
};
