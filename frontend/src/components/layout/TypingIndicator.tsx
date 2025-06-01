'use client';

import { useSocketStore } from '../../store/socket-store';
import { Paper, Text, Group, Avatar, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';

export default function TypingIndicator() {
    const { typingUsers } = useSocketStore();
    const typingUsersArray = Array.from(typingUsers.values());
    const [visible, { open, close }] = useDisclosure(false);

    useEffect(() => {
        if (typingUsersArray.length > 0) {
            open();
        } else {
            close();
        }
    }, [typingUsersArray.length, open, close]);

    if (typingUsersArray.length === 0 || !visible) {
        return null;
    }

    // 表示するユーザー数を制限
    const displayedUsers = typingUsersArray.slice(0, 3);
    const additionalCount = Math.max(0, typingUsersArray.length - 3);

    return (
        <Box
            style={{
                position: 'fixed',
                bottom: '1rem',
                left: '1rem',
                zIndex: 20,
                animation: 'slideUp 0.3s ease-out',
            }}
        >
            <Paper p="xs" radius="lg" shadow="md">
                <Group gap="xs">
                    <Group gap={8} wrap="nowrap">
                        {displayedUsers.map(user => (
                            <Avatar
                                key={user.userId}
                                color="blue"
                                radius="xl"
                                size="sm"
                            >
                                {user.displayName.charAt(0)}
                            </Avatar>
                        ))}
                    </Group>

                    <Group gap={4}>
                        <Text size="sm">
                            {displayedUsers.map(user => user.displayName).join(', ')}
                            {additionalCount > 0 && ` 他${additionalCount}人`}
                        </Text>
                        <Text size="sm" c="dimmed">が入力中</Text>
                        <Text
                            component="span"
                            style={{
                                animation: 'bounce 1s infinite',
                                display: 'inline-block',
                                marginLeft: '2px'
                            }}
                        >
                            .
                        </Text>
                        <Text
                            component="span"
                            style={{
                                animation: 'bounce 1s infinite',
                                display: 'inline-block',
                                animationDelay: '0.2s'
                            }}
                        >
                            .
                        </Text>
                        <Text
                            component="span"
                            style={{
                                animation: 'bounce 1s infinite',
                                display: 'inline-block',
                                animationDelay: '0.4s'
                            }}
                        >
                            .
                        </Text>
                    </Group>
                </Group>
            </Paper>

            <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
        </Box>
    );
}