import axios from 'axios';

// APIクライアントのベース設定
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  withCredentials: true, // Cookie認証のため
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => {
    // 成功時のレスポンスをログに記録（デバッグ用）
    if (process.env.NODE_ENV !== 'production') {
      console.log(`API成功 [${response.config.method?.toUpperCase()}] ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // エラーログ（デバッグ用）
    console.error('APIエラー:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // エラーレスポンス整形
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'サーバーエラーが発生しました',
      errors: error.response?.data?.errors || [],
    };
    
    return Promise.reject(errorResponse);
  }
);

export default api;
