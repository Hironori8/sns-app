'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth-store';
import { 
  TextInput, 
  PasswordInput, 
  Paper, 
  Title, 
  Container,
  Button, 
  Anchor, 
  Group, 
  Divider, 
  Alert,
  Stack,
  Text
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconAlertCircle, 
  IconAt, 
  IconLock, 
  IconUser, 
  IconId 
} from '@tabler/icons-react';

interface RegisterFormValues {
  username: string;
  displayName: string;
  email: string;
  password: string;
}

export default function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, error, isLoading, clearError } = useAuthStore();
  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    initialValues: {
      username: '',
      displayName: '',
      email: '',
      password: '',
    },
    validate: {
      username: (value) => 
        !value 
          ? 'ユーザー名を入力してください' 
          : value.length < 3 
            ? 'ユーザー名は3文字以上である必要があります' 
            : value.length > 20 
              ? 'ユーザー名は20文字以下である必要があります' 
              : null,
      displayName: (value) => 
        !value 
          ? '表示名を入力してください' 
          : value.length > 50 
            ? '表示名は50文字以下である必要があります' 
            : null,
      email: (value) => 
        !value 
          ? 'メールアドレスを入力してください' 
          : /^\S+@\S+$/.test(value) 
            ? null 
            : '有効なメールアドレスを入力してください',
      password: (value) => 
        !value 
          ? 'パスワードを入力してください' 
          : value.length < 6 
            ? 'パスワードは6文字以上である必要があります' 
            : value.length > 100 
              ? 'パスワードは100文字以下である必要があります' 
              : null,
    },
  });

  const handleSubmit = async (values: RegisterFormValues) => {
    clearError();
    setIsSubmitting(true);
    
    try {
      const user = await register(values.username, values.displayName, values.email, values.password);
      
      if (user) {
        console.log('登録成功:', user);
        // わずかに遅延させて認証状態が確実に更新されるようにする
        setTimeout(() => {
          router.push('/main');
        }, 100);
      }
    } catch (err) {
      console.error('登録処理エラー:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="xs" px="xs">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Title ta="center" order={2} mb="md">新規アカウント登録</Title>
        
        {error && (
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="エラー" 
            color="red" 
            mb="md"
            variant="light"
          >
            {error}
          </Alert>
        )}
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label="ユーザー名"
              placeholder="unique_username"
              {...form.getInputProps('username')}
              leftSection={<IconId size="1rem" />}
              disabled={isLoading || isSubmitting}
              description="3～20文字、英数字・アンダースコア"
            />
            
            <TextInput
              required
              label="表示名"
              placeholder="あなたの名前"
              {...form.getInputProps('displayName')}
              leftSection={<IconUser size="1rem" />}
              disabled={isLoading || isSubmitting}
            />
            
            <TextInput
              required
              label="メールアドレス"
              placeholder="example@mail.com"
              {...form.getInputProps('email')}
              leftSection={<IconAt size="1rem" />}
              disabled={isLoading || isSubmitting}
            />
            
            <PasswordInput
              required
              label="パスワード"
              placeholder="パスワードを入力"
              {...form.getInputProps('password')}
              leftSection={<IconLock size="1rem" />}
              disabled={isLoading || isSubmitting}
              description="6文字以上の安全なパスワード"
            />
          </Stack>
          
          <Button 
            fullWidth 
            mt="xl" 
            type="submit"
            loading={isLoading || isSubmitting}
          >
            アカウント作成
          </Button>
        </form>
        
        <Divider label="または" labelPosition="center" my="lg" />
        
        <Group justify="center" mt="md">
          <Text size="sm">
            既にアカウントをお持ちですか？{' '}
            <Anchor component={Link} href="/auth/login" fw={700}>
              ログイン
            </Anchor>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}