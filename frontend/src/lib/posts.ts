import api from './api';
import { Post, PostResponse, PostsResponse } from '../types';

interface PostQueryParams {
  page?: number;
  pageSize?: number;
  userId?: number;
}

export const postsApi = {
  // 投稿作成
  async createPost(content: string): Promise<PostResponse> {
    const response = await api.post<PostResponse>('/posts', { content });
    return response.data;
  },

  // 投稿一覧取得（タイムライン）
  async getPosts(params: PostQueryParams = {}): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>('/posts', { params });
    return response.data;
  },

  // 特定ユーザーの投稿取得
  async getUserPosts(userId: number, params: Omit<PostQueryParams, 'userId'> = {}): Promise<PostsResponse> {
    const response = await api.get<PostsResponse>(`/posts/user/${userId}`, { 
      params 
    });
    return response.data;
  },

  // 投稿詳細取得
  async getPostById(id: number): Promise<PostResponse> {
    const response = await api.get<PostResponse>(`/posts/${id}`);
    return response.data;
  },

  // 投稿削除
  async deletePost(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/posts/${id}`);
    return response.data;
  },

  // ユーザーの投稿数取得
  async getUserPostCount(userId: number): Promise<{ userId: number; postCount: number }> {
    const response = await api.get<{ userId: number; postCount: number }>(
      `/posts/user/${userId}/count`
    );
    return response.data;
  },
};
