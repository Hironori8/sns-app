'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Post } from '../../types';
import { useAuthStore } from '../../store/auth-store';
import Link from 'next/link';
import {
    Paper,
    Group,
    Avatar,
    Text,
    ActionIcon,
    Menu,
    UnstyledButton,
    Stack,
    Divider,
    Modal,
    Button
} from '@mantine/core';
import { IconDots, IconHeart, IconHeartFilled, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface PostItemProps {
    post: Post;
    onLike?: (postId: number) => Promise<void>;
    onUnlike?: (postId: number) => Promise<void>;
    onDelete?: (postId: number) => Promise<void>;
}

export default function PostItem({ post, onLike, onUnlike, onDelete }: PostItemProps) {
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    const [opened, { open: openModal, close: closeModal }] = useDisclosure(false);
    const { user } = useAuthStore();

    const isAuthor = user?.id === post.authorId;
    const formattedDate = formatDistanceToNow(new Date(post.createdAt), { locale: ja, addSuffix: true });

    const handleLikeToggle = async () => {
        if (isLikeLoading || !user) return;
        setIsLikeLoading(true);

        try {
            if (post.isLiked) {
                await onUnlike?.(post.id);
            } else {
                await onLike?.(post.id);
            }
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleDelete = async () => {
        if (isDeleteLoading || !isAuthor) return;
        setIsDeleteLoading(true);
        try {
            await onDelete?.(post.id);
        } finally {
            setIsDeleteLoading(false);
            closeModal();
        }
    };

    return (
        <>
            <Paper
                withBorder
                p="md"
                radius="md"
                mb="md"
                shadow="sm"
            >
                <Group justify="space-between" wrap="nowrap" mb="xs">
                    <Group gap="xs" wrap="nowrap">
                        <UnstyledButton component={Link} href={`/profile/${post.authorId}`}>
                            <Avatar
                                color="blue"
                                radius="xl"
                                size="md"
                            >
                                {post.author?.displayName.charAt(0) || 'U'}
                            </Avatar>
                        </UnstyledButton>

                        <Stack gap={0}>
                            <Group gap={6} wrap="nowrap">
                                <UnstyledButton component={Link} href={`/profile/${post.authorId}`}>
                                    <Text fw={500} size="sm">
                                        {post.author?.displayName || 'Unknown'}
                                    </Text>
                                </UnstyledButton>
                                <Text c="dimmed" size="xs">@{post.author?.username || 'user'}</Text>
                            </Group>
                            <Text size="xs" c="dimmed">{formattedDate}</Text>
                        </Stack>
                    </Group>

                    {isAuthor && (
                        <Menu shadow="md" width={160} position="bottom-end">
                            <Menu.Target>
                                <ActionIcon
                                    variant="subtle"
                                    size="sm"
                                    color="gray"
                                    disabled={isDeleteLoading}
                                >
                                    <IconDots size="1rem" />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item
                                    color="red"
                                    leftSection={<IconTrash size={14} />}
                                    onClick={openModal}
                                    disabled={isDeleteLoading}
                                >
                                    {isDeleteLoading ? '削除中...' : '投稿を削除'}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    )}
                </Group>

                <Text size="sm" my="sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {post.content}
                </Text>

                <Divider my="xs" />

                <Group>
                    <ActionIcon
                        onClick={handleLikeToggle}
                        variant={post.isLiked ? 'light' : 'subtle'}
                        color={post.isLiked ? 'red' : 'gray'}
                        disabled={isLikeLoading || !user}
                        loading={isLikeLoading}
                        radius="xl"
                        size="md"
                    >
                        {post.isLiked ? (
                            <IconHeartFilled size="1rem" />
                        ) : (
                            <IconHeart size="1rem" />
                        )}
                    </ActionIcon>

                    <Text size="sm" c="dimmed">
                        {post.likeCount || 0}
                    </Text>
                </Group>
            </Paper>

            <Modal opened={opened} onClose={closeModal} title="投稿を削除" centered>
                <Text size="sm" mb="md">
                    この投稿を削除してもよろしいですか？この操作は元に戻せません。
                </Text>
                <Group justify="flex-end" gap="sm">
                    <Button variant="outline" onClick={closeModal}>キャンセル</Button>
                    <Button color="red" loading={isDeleteLoading} onClick={handleDelete}>
                        削除する
                    </Button>
                </Group>
            </Modal>
        </>
    );
}