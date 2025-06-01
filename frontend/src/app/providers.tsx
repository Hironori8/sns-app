'use client';

import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider, createTheme, MantineColorsTuple } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import '@mantine/core/styles.css';


// React Queryクライアントの作成
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// カラーパレットの定義
const myBlue: MantineColorsTuple = [
  '#eaf3ff',
  '#d5e3fc',
  '#abc6f9',
  '#7ea6f4',
  '#598df0',
  '#417fee',
  '#2f77ee',
  '#1968e5',
  '#0a5dd7',
  '#0052c9'
];

// カスタムテーマの作成
const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue: myBlue,
  },
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      }
    }
  }
});

// グローバルプロバイダー
const ProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <QueryClientProvider client={queryClient}>
        <ModalsProvider>
          {children}
        </ModalsProvider>
      </QueryClientProvider>
    </MantineProvider>
  );
};

export default ProviderWrapper;