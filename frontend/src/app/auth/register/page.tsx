import RegisterForm from '../../../components/auth/RegisterForm';
import { Metadata } from 'next';
import { Container, Title, Text, Box } from '@mantine/core';

export const metadata: Metadata = {
  title: '新規登録 | SNSアプリ',
  description: 'SNSアプリの新規ユーザー登録ページです',
};

export default function RegisterPage() {
  return (
    <Container size="md" py={60}>
      <Box ta="center" mb={50}>
        <Title>SNS App</Title>
        <Text c="dimmed" mt="md">
          アカウントを作成して、つながりを広げましょう
        </Text>
      </Box>

      <RegisterForm />
    </Container>
  );
}