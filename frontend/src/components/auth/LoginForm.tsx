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
import { IconAlertCircle, IconAt, IconLock } from '@tabler/icons-react';

interface LoginFormValues {
  identifier: string;
  password: string;
}

export default function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, isLoading, clearError } = useAuthStore();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    initialValues: {
      identifier: '',
      password: '',
    },
    validate: {
      identifier: (value) => (value ? null : 'ユーザー名またはメールアドレスを入力してください'),
      password: (value) => (value ? null : 'パスワードを入力してください'),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    clearError();
    setIsSubmitting(true);
    
    try {
      const user = await login(values.identifier, values.password);
      
      if (user) {
        console.log('ログイン成功:', user);
        // わずかに遅延させて認証状態が確実に更新されるようにする
        setTimeout(() => {
          router.push('/main');
        }, 100);
      }
    } catch (err) {
      console.error('ログイン処理エラー:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="xs" px="xs">
      <Paper radius="md" p="xl" withBorder shadow="md">
        <Title ta="center" order={2} mb="md">ログイン</Title>
        
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
              label="ユーザー名またはメールアドレス"
              placeholder="your_username または example@mail.com"
              {...form.getInputProps('identifier')}
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
            />
          </Stack>
          
          <Button 
            fullWidth 
            mt="xl" 
            type="submit"
            loading={isLoading || isSubmitting}
          >
            ログイン
          </Button>
        </form>
        
        <Divider label="または" labelPosition="center" my="lg" />
        
        <Group justify="center" mt="md">
          <Text size="sm">
            アカウントをお持ちではないですか？{' '}
            <Anchor component={Link} href="/auth/register" fw={700}>
              新規登録
            </Anchor>
          </Text>
        </Group>
      </Paper>
    </Container>
  );
}