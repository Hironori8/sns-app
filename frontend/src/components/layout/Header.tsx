'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth-store';
import { useSocketStore } from '../../store/socket-store';
import {
  Group,
  Title,
  Button,
  Text,
  Avatar,
  Badge,
  Container,
  Menu,
  ActionIcon,
  useMantineColorScheme,
  rem,
  Box
} from '@mantine/core';
import { IconLogout, IconHome, IconUser, IconMoonStars, IconSun } from '@tabler/icons-react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { connect, disconnect, onlineCount } = useSocketStore();
  const router = useRouter();
  const { setColorScheme, colorScheme } = useMantineColorScheme();

  // WebSocket接続を認証状態に応じて管理
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }
  }, [isAuthenticated, connect, disconnect]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
      <Box
          component="header"
          h={60}
          px="md"
          style={(theme) => ({
            borderBottom: `1px solid ${theme.colors.gray[3]}`,
            backgroundColor: theme.colors.white,
          })}
      >
        <Container size="xl">
          <Group justify="space-between" h="100%">
            <Group>
              <Title order={3} c="blue">SNS App</Title>

              {isAuthenticated && (
                  <Badge size="sm" variant="light" color="blue">
                    オンライン: {onlineCount}人
                  </Badge>
              )}
            </Group>

            <Group>
              <ActionIcon
                  onClick={toggleColorScheme}
                  variant="default"
                  size="md"
                  aria-label="Toggle color scheme"
              >
                {colorScheme === 'dark' ? (
                    <IconSun style={{ width: rem(18), height: rem(18) }} />
                ) : (
                    <IconMoonStars style={{ width: rem(18), height: rem(18) }} />
                )}
              </ActionIcon>

              {isAuthenticated ? (
                  <>
                    <Button
                        component={Link}
                        href="/main"
                        variant="subtle"
                        leftSection={<IconHome size="1rem" />}
                    >
                      ホーム
                    </Button>

                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <Button variant="subtle">
                          <Group gap="xs">
                            <Avatar
                                size="sm"
                                color="blue"
                                radius="xl"
                            >
                              {user?.displayName.charAt(0) || 'U'}
                            </Avatar>
                            <Text size="sm" fw={500}>{user?.displayName || 'ユーザー'}</Text>
                          </Group>
                        </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Label>アカウント</Menu.Label>
                        <Menu.Item
                            component={Link}
                            href={`/profile/${user?.id}`}
                            leftSection={<IconUser size={14} />}
                        >
                          プロフィール
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                            onClick={handleLogout}
                            color="red"
                            leftSection={<IconLogout size={14} />}
                        >
                          ログアウト
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </>
              ) : (
                  <>
                    <Button
                        component={Link}
                        href="/auth/login"
                        variant="subtle"
                    >
                      ログイン
                    </Button>
                    <Button
                        component={Link}
                        href="/auth/register"
                    >
                      新規登録
                    </Button>
                  </>
              )}
            </Group>
          </Group>
        </Container>
      </Box>
  );
}