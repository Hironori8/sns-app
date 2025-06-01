import LoginForm from '../../../components/auth/LoginForm';
import { Metadata } from 'next';
import { Container, Title, Text, Box } from '@mantine/core';

export const metadata: Metadata = {
  title: 'ログイン | SNSアプリ',
  description: 'SNSアプリのログインページです',
};

export default function LoginPage() {
  return (
    <Container size="md" py={60}>
      <Box ta="center" mb={50}>
        <Title>SNS App</Title>
        <Text c="dimmed" mt="md">
          シンプルなソーシャルネットワーキングサービスへようこそ
        </Text>
      </Box>

      <LoginForm />
    </Container>
  );
}