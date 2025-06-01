export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  authorId: number;
  createdAt: string;
  updatedAt: string;
  author?: User;
  isLiked?: boolean;
  likeCount?: number;
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
  createdAt: string;
  user?: User;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface PostResponse {
  post: Post;
  message: string;
}

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface OnlineUser {
  userId: number;
  username: string;
  displayName: string;
}

export interface OnlineUsersData {
  users: OnlineUser[];
  count: number;
}

export interface TypingData {
  userId: number;
  username: string;
  displayName: string;
  isTyping: boolean;
}
