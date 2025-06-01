import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '../store/auth-store';

// 認証状態に応じてリダイレクトするカスタムフック
export function useAuthRedirect(redirectTo: string, redirectIfAuthenticated = false) {
  const router = useRouter();
  const { isAuthenticated, checkingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    // 初回ロード時に認証状態を確認
    if (!isAuthenticated) {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    // 認証確認中は処理しない
    if (checkingAuth) return;

    // リダイレクト処理
    if (redirectIfAuthenticated && isAuthenticated) {
      // 認証済みならリダイレクト
      router.push(redirectTo);
    } else if (!redirectIfAuthenticated && !isAuthenticated) {
      // 非認証ならリダイレクト
      router.push(redirectTo);
    }
  }, [checkingAuth, isAuthenticated, redirectIfAuthenticated, redirectTo, router]);

  return { checkingAuth, isAuthenticated };
}
