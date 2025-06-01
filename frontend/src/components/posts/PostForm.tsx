'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/auth-store';
import { emitTypingStart, emitTypingStop } from '../../lib/socket';
import { Paper, Textarea, Button, Group, Text, Avatar } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconSend } from '@tabler/icons-react';

interface PostFormProps {
  onPostSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
}

export default function PostForm({ onPostSubmit, isSubmitting = false }: PostFormProps) {
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuthStore();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm({
    initialValues: {
      content: '',
    },
    validate: {
      content: (value) => (value.trim().length === 0 ? '投稿内容を入力してください' : null),
    },
  });

  const characterCount = form.values.content.length;
  const maxLength = 280;

  // タイピング状態管理
  useEffect(() => {
    if (!user) return;

    const content = form.values.content;
    
    if (content && !isTyping) {
      setIsTyping(true);
      emitTypingStart();
    } else if (!content && isTyping) {
      setIsTyping(false);
      emitTypingStop();
    }

    // タイピング停止タイマー
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (content) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          emitTypingStop();
        }
      }, 2000); // 2秒間入力がないとタイピング停止とみなす
    }

    // クリーンアップ
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        emitTypingStop();
      }
    };
  }, [form.values.content, isTyping, user]);

  const handleSubmit = async (values: { content: string }) => {
    if (!values.content.trim() || isSubmitting) return;

    // タイピング状態をリセット
    if (isTyping) {
      setIsTyping(false);
      emitTypingStop();
    }

    await onPostSubmit(values.content);
    form.reset();
  };

  return (
    <Paper withBorder p="md" radius="md" mb="xl" shadow="sm">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Group align="flex-start" mb="xs">
          <Avatar color="blue" radius="xl">
            {user?.displayName?.charAt(0) || 'U'}
          </Avatar>
          
          <Textarea
            placeholder="今何してる？"
            autosize
            minRows={2}
            maxRows={6}
            w="100%"
            {...form.getInputProps('content')}
            disabled={isSubmitting}
            maxLength={maxLength}
          />
        </Group>
        
        <Group justify="space-between" mt="xs">
          <Text 
            size="sm" 
            c={characterCount > 250 ? 'red' : 'dimmed'}
          >
            {characterCount}/{maxLength}
          </Text>
          
          <Button 
            type="submit"
            disabled={!form.values.content.trim() || isSubmitting}
            loading={isSubmitting}
            rightSection={<IconSend size="1rem" />}
          >
            投稿
          </Button>
        </Group>
      </form>
    </Paper>
  );
}