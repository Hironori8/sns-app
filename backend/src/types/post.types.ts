export interface PostWithAuthor {
  id: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: number;
    username: string;
    displayName: string;
  };
  likeCount: number;
  isLikedByCurrentUser?: boolean;
}

export interface PaginatedPostsResponse {
  posts: PostWithAuthor[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface LikeResponse {
  id: number;
  isLiked: boolean;
  likeCount: number;
  message: string;
}
