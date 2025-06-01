'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { usePostsStore } from '@/store/posts-store';
import { useSocketStore } from '@/store/socket-store';
import PostForm from '../../components/posts/PostForm';
import PostList from '../../components/posts/PostList';
import OnlineUsers from '../../components/layout/OnlineUsers';
import TypingIndicator from '../../components/layout/TypingIndicator';
import { 
  Container, 
  Grid, 
  Title, 
  Center, 
  Loader,
  Stack,
  Box,
  Paper,
  Button,
  Text
} from '@mantine/core';

export default function MainPage() {
  const router = useRouter();
  const { isAuthenticated, checkingAuth, checkAuth } = useAuthStore();
  const { 
    posts, 
    isLoading, 
    hasMore, 
    fetchPosts, 
    createPost, 
    resetPosts, 
    page,
    error
  } = usePostsStore();
  const { connect } = useSocketStore();

  // 認証状態の確認
  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuth();
      console.log('認証状態:', isAuth);
    };
    verifyAuth();
  }, [checkAuth]);

  // 非認証時はログインページにリダイレクト
  useEffect(() => {
    if (!checkingAuth && !isAuthenticated) {
      console.log('ログインページへリダイレクト', { checkingAuth, isAuthenticated });
      router.push('/auth/login');
    }
  }, [checkingAuth, isAuthenticated, router]);

  // 投稿取得
  useEffect(() => {
    if (isAuthenticated) {
      console.log('投稿データ取得開始');
      fetchPosts(1, true);
      connect(); // WebSocket接続
    }

    return () => {
      resetPosts();
    };
  }, [isAuthenticated, fetchPosts, resetPosts, connect]);

  // 新規投稿処理
  const handlePostSubmit = async (content: string) => {
    await createPost(content);
  };

  // スクロールによる追加読み込み
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchPosts(page + 1);
    }
  };

  if (checkingAuth) {
    return (
      <Container py={50}>
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size="lg" py="md">
      <Grid>
        {/* メインコンテンツ */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Box mb="lg">
            <Title order={2} mb="lg">ホームタイムライン</Title>
            
            {isAuthenticated && (
              <PostForm 
                onPostSubmit={handlePostSubmit} 
                isSubmitting={false}
              />
            )}
            
            {error ? (
              <Paper p="md" withBorder radius="md" my="md">
                <Text color="red" align="center">{error}</Text>
                <Button 
                  onClick={() => fetchPosts(1, true)} 
                  variant="outline" 
                  color="blue" 
                  fullWidth
                  mt="sm"
                >
                  再読み込み
                </Button>
              </Paper>
            ) : (
              <PostList 
                posts={posts}
                hasMore={hasMore}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
              />
            )}
          </Box>
        </Grid.Col>
        
        {/* サイドバー */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack>
            <OnlineUsers />
          </Stack>
        </Grid.Col>
      </Grid>
      
      {/* タイピングインジケータ */}
      <TypingIndicator />
    </Container>
  );
}