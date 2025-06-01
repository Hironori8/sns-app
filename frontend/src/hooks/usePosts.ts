import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../lib/posts';
import { likesApi } from '../lib/likes';
import { Post, PostsResponse } from '../types';

// 全投稿取得フック
export function usePosts(page: number = 1, pageSize: number = 10) {
  return useQuery<PostsResponse>({
    queryKey: ['posts', { page, pageSize }],
    queryFn: () => postsApi.getPosts({ page, pageSize }),
    keepPreviousData: true,
  });
}

// 特定ユーザーの投稿取得フック
export function useUserPosts(userId: number, page: number = 1, pageSize: number = 10) {
  return useQuery<PostsResponse>({
    queryKey: ['userPosts', userId, { page, pageSize }],
    queryFn: () => postsApi.getUserPosts(userId, { page, pageSize }),
    keepPreviousData: true,
    enabled: !!userId,
  });
}

// 投稿詳細取得フック
export function usePost(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => postsApi.getPostById(postId),
    enabled: !!postId,
  });
}

// 投稿作成フック
export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (content: string) => postsApi.createPost(content),
    onSuccess: () => {
      // 投稿一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// 投稿削除フック
export function useDeletePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => postsApi.deletePost(postId),
    onSuccess: (_, postId) => {
      // 投稿一覧を再取得
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      
      // ユーザーの投稿数を再取得
      // Note: ここではauthorIdが必要だが、引数で受け取るには変更が必要
      const cache = queryClient.getQueryData<{ post: Post }>([
        'post',
        postId,
      ]);
      
      if (cache?.post?.authorId) {
        queryClient.invalidateQueries({ 
          queryKey: ['userPostCount', cache.post.authorId] 
        });
      }
    },
  });
}

// 「いいね」追加フック
export function useLikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => likesApi.likePost(postId),
    onSuccess: (_, postId) => {
      // 「いいね」状態を更新
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['postLikeStatus', postId] });
      
      // 投稿一覧内の「いいね」状態を手動更新
      queryClient.setQueriesData<PostsResponse>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map(post =>
              post.id === postId
                ? { 
                    ...post, 
                    isLiked: true, 
                    likeCount: (post.likeCount || 0) + 1 
                  }
                : post
            )
          };
        }
      );
    },
  });
}

// 「いいね」削除フック
export function useUnlikePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (postId: number) => likesApi.unlikePost(postId),
    onSuccess: (_, postId) => {
      // 「いいね」状態を更新
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['postLikeStatus', postId] });
      
      // 投稿一覧内の「いいね」状態を手動更新
      queryClient.setQueriesData<PostsResponse>(
        { queryKey: ['posts'] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            posts: old.posts.map(post =>
              post.id === postId
                ? { 
                    ...post, 
                    isLiked: false, 
                    likeCount: Math.max((post.likeCount || 0) - 1, 0) 
                  }
                : post
            )
          };
        }
      );
    },
  });
}
