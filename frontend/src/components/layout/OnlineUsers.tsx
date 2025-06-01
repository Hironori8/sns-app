'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSocketStore } from '../../store/socket-store';
import { 
  Paper, 
  Title, 
  Text, 
  Group, 
  Avatar, 
  Badge, 
  Stack, 
  Divider,
  UnstyledButton,
  Skeleton
} from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';

export default function OnlineUsers() {
  const { onlineUsers, isConnected, connect, getOnlineUsers } = useSocketStore();

  // 初期ロード時にオンラインユーザー一覧を取得
  useEffect(() => {
    if (!isConnected) {
      connect();
    } else {
      getOnlineUsers();
    }
  }, [isConnected, connect, getOnlineUsers]);

  // 定期的にオンラインユーザー一覧を更新
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        getOnlineUsers();
      }
    }, 60000); // 1分毎

    return () => clearInterval(interval);
  }, [isConnected, getOnlineUsers]);

  if (!isConnected) {
    return (
      <Paper withBorder p="md" radius="md">
        <Group mb="md">
          <IconUsers size="1.2rem" />
          <Title order={5}>オンラインユーザー</Title>
        </Group>
        <Skeleton height={50} radius="sm" mb="sm" />
        <Skeleton height={50} radius="sm" mb="sm" />
        <Skeleton height={50} radius="sm" />
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      <Group mb="xs" position="apart">
        <Group>
          <IconUsers size="1.2rem" />
          <Title order={5}>オンラインユーザー</Title>
        </Group>
        <Badge size="sm" variant="light" color="blue">
          {onlineUsers.length}人
        </Badge>
      </Group>
      
      <Divider my="sm" />
      
      <Stack spacing="xs">
        {onlineUsers.length > 0 ? (
          onlineUsers.map((user) => (
            <UnstyledButton 
              key={user.userId}
              component={Link} 
              href={`/profile/${user.userId}`}
            >
              <Group spacing="sm" p="xs" style={{ borderRadius: 4 }} className="hover:bg-gray-50">
                <Avatar 
                  color="blue" 
                  radius="xl" 
                  size="sm"
                >
                  {user.displayName.charAt(0)}
                </Avatar>
                <Stack spacing={0}>
                  <Text size="sm" fw={500}>{user.displayName}</Text>
                  <Text size="xs" c="dimmed">@{user.username}</Text>
                </Stack>
              </Group>
            </UnstyledButton>
          ))
        ) : (
          <Text ta="center" size="sm" c="dimmed" py="md">
            オンラインユーザーがいません
          </Text>
        )}
      </Stack>
    </Paper>
  );
}