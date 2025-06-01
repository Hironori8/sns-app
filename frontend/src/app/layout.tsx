import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '../components/layout/Header';
import ProviderWrapper from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SNSアプリ',
  description: 'シンプルなソーシャルネットワーキングサービス',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <ProviderWrapper>
          <Header />
          <main>
            {children}
          </main>
        </ProviderWrapper>
      </body>
    </html>
  );
}