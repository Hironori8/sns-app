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
  authorId?: number; // Backend might not include this directly
  createdAt: string;
  updatedAt: string;
  author: User; // Make this required since backend always includes it
  isLiked?: boolean;
  likeCount: number; // Make required since backend always includes it
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

export interface PostLikedData {
  postId: number;
  userId: number;
  username: string;
  likeCount: number;
  isLiked: boolean;
}

export interface Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  createdAt: string;
  updatedAt?: string;
  user: User;
}

export interface CommentData {
  id: number;
  postId: number;
  content: string;
  user: {
    id: number;
    username: string;
    displayName: string;
  };
  createdAt: Date;
}

export interface CommentDeletedData {
  id: number;
  postId: number;
}
