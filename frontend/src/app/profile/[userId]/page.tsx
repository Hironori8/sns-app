'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '../../../store/auth-store';
import { usePostsStore } from '../../../store/posts-store';
import PostList from '../../../components/posts/PostList';
import OnlineUsers from '../../../components/layout/OnlineUsers';
import TypingIndicator from '../../../components/layout/TypingIndicator';
import { postsApi } from '../../../lib/posts';
import { likesApi } from '../../../lib/likes';
import { 
  Container, 
  Paper, 
  Avatar, 
  Title, 
  Text, 
  Group, 
  Skeleton,
  Stack,
  Grid,
  Box,
  Center,
  Loader,
  Badge
} from '@mantine/core';
import { IconMessageCircle, IconHeart } from '@tabler/icons-react';

export default function ProfilePage() {
  const params = useParams<{ userId: string }>();
  const userId = parseInt(params.userId, 10);
  const router = useRouter();
  const { isAuthenticated, checkingAuth, checkAuth, user } = useAuthStore();
  const { 
    posts, 
    isLoading, 
    hasMore, 
    page,
    fetchUserPosts, 
    resetPosts 
  } = usePostsStore();
  
  const [postCount, setPostCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // 認証確認
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ユーザーデータの取得
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId && !isNaN(userId)) {
        setIsLoadingProfile(true);
        try {
          // 投稿といいね数を取得
          const [postCountResult, likeCountResult] = await Promise.all([
            postsApi.getUserPostCount(userId),
            likesApi.getUserLikeCount(userId)
          ]);
          
          setPostCount(postCountResult.postCount);
          setLikeCount(likeCountResult.likeCount);
          
          // 最初の投稿を取得してユーザー情報を取得
          const userPostsResponse = await postsApi.getUserPosts(userId, { page: 1, pageSize: 1 });
          if (userPostsResponse.posts.length > 0 && userPostsResponse.posts[0].author) {
            setProfileUser(userPostsResponse.posts[0].author);
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    fetchUserData();
    
    // ユーザー投稿取得
    if (userId && !isNaN(userId)) {
      fetchUserPosts(userId, 1, true);
    }
    
    return () => {
      resetPosts();
    };
  }, [userId, fetchUserPosts, resetPosts]);
  
  // 追加読み込み処理
  const handleLoadMore = () => {
    if (!isLoading && hasMore && userId) {
      fetchUserPosts(userId, page + 1);
    }
  };
  
  // ローディング表示
  if (checkingAuth) {
    return (
      <Container py={50}>
        <Center>
          <Loader size="lg" />
        </Center>
      </Container>
    );
  }
  
  const isOwnProfile = user?.id === userId;
  
  return (
    <Container size="lg" py="md">
      <Grid>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder radius="md" p="xl" mb="xl">
            {profileUser ? (
              <Group align="flex-start" position="apart">
                <Group>
                  <Avatar 
                    radius={50} 
                    size="xl" 
                    color="blue"
                  >
                    {profileUser.displayName.charAt(0)}
                  </Avatar>
                  
                  <div>
                    <Title order={3}>{profileUser.displayName}</Title>
                    <Text c="dimmed" size="sm">@{profileUser.username}</Text>
                    
                    {isOwnProfile && (
                      <Badge mt="xs" color="blue" variant="light">
                        あなたのプロフィール
                      </Badge>
                    )}
                  </div>
                </Group>
                
                <Group>
                  <Paper withBorder p="md" radius="md">
                    <Group spacing={4} mb={2} position="center">
                      <IconMessageCircle size="1rem" stroke={1.5} />
                      <Text size="sm">投稿</Text>
                    </Group>
                    <Text fw={700} size="lg" ta="center">{postCount}</Text>
                  </Paper>
                  
                  <Paper withBorder p="md" radius="md">
                    <Group spacing={4} mb={2} position="center">
                      <IconHeart size="1rem" stroke={1.5} />
                      <Text size="sm">いいね</Text>
                    </Group>
                    <Text fw={700} size="lg" ta="center">{likeCount}</Text>
                  </Paper>
                </Group>
              </Group>
            ) : isLoadingProfile ? (
              <Stack>
                <Group>
                  <Skeleton height={80} circle />
                  <div style={{ flex: 1 }}>
                    <Skeleton height={28} width="50%" mb="xs" />
                    <Skeleton height={16} width="30%" />
                  </div>
                </Group>
              </Stack>
            ) : (
              <Center py="xl">
                <Text c="dimmed">ユーザーが見つかりません</Text>
              </Center>
            )}
          </Paper>

          <Box mb="lg">
            <Title order={3} mb="md">投稿</Title>
            <PostList
              posts={posts}
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
            />
          </Box>
        </Grid.Col>
        
        {/* サイドバー */}
        <Grid.Col span={{ base: 12, md: 4 }} hiddenFrom="md">
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