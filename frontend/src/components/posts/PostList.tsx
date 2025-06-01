'use client';

import { useEffect, useState } from 'react';
import { Post } from '../../types';
import PostItem from './PostItem';
import { useLikePost, useUnlikePost, useDeletePost } from '../../hooks/usePosts';
import { Button, Center, Paper, Text, Loader, Stack } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

interface PostListProps {
  posts: Post[];
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  showLoadMoreButton?: boolean;
}

export default function PostList({ 
  posts, 
  hasMore, 
  isLoading, 
  onLoadMore,
  showLoadMoreButton = true,
}: PostListProps) {
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const likePostMutation = useLikePost();
  const unlikePostMutation = useUnlikePost();
  const deletePostMutation = useDeletePost();

  // 親コンポーネントからの投稿データの更新を反映
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const handleLike = async (postId: number) => {
    await likePostMutation.mutateAsync(postId);
  };

  const handleUnlike = async (postId: number) => {
    await unlikePostMutation.mutateAsync(postId);
  };

  const handleDelete = async (postId: number) => {
    await deletePostMutation.mutateAsync(postId);
  };

  if (posts.length === 0 && !isLoading) {
    return (
      <Paper p="xl" withBorder radius="md" ta="center">
        <Text c="dimmed">投稿がまだありません</Text>
      </Paper>
    );
  }

  return (
    <Stack>
      {localPosts.map((post) => (
        <PostItem
          key={post.id}
          post={post}
          onLike={handleLike}
          onUnlike={handleUnlike}
          onDelete={handleDelete}
        />
      ))}
      
      {showLoadMoreButton && hasMore && (
        <Center my="md">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            variant="light"
            leftSection={isLoading ? <Loader size="xs" /> : <IconRefresh size="1rem" />}
          >
            {isLoading ? '読み込み中...' : 'もっと読み込む'}
          </Button>
        </Center>
      )}
      
      {isLoading && !hasMore && (
        <Center my="md">
          <Loader size="sm" />
        </Center>
      )}
    </Stack>
  );
}