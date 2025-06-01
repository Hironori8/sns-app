# クイックWebSocketテストスクリプト

echo "🧪 WebSocketリアルタイム機能テスト開始..."

# 1. ログイン（Cookieを取得）
echo "🔑 ログイン中..."
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier": "alice", "password": "password123"}' \
  -c test_cookies.txt \
  -s > /dev/null

if [ $? -eq 0 ]; then
    echo "✅ ログイン成功"
else
    echo "❌ ログイン失敗"
    exit 1
fi

# 2. 現在の投稿一覧を取得
echo "📋 現在の投稿一覧を取得..."
posts_before=$(curl -s http://localhost:3001/posts | jq '.posts | length')
echo "投稿数: $posts_before"

# 3. 新規投稿を作成（WebSocket通知がトリガーされる）
echo "📝 新規投稿を作成中..."
post_response=$(curl -X POST http://localhost:3001/posts \
  -H "Content-Type: application/json" \
  -d "{\"content\": \"WebSocketテスト投稿 $(date)\"}" \
  -b test_cookies.txt \
  -s)

if [[ $post_response == *"投稿を作成しました"* ]]; then
    echo "✅ 投稿作成成功"
    post_id=$(echo $post_response | jq -r '.post.id')
    echo "投稿ID: $post_id"
else
    echo "❌ 投稿作成失敗"
    echo "レスポンス: $post_response"
    exit 1
fi

# 4. いいね操作テスト（WebSocket通知がトリガーされる）
echo "❤️ いいね操作テスト..."
like_response=$(curl -X POST http://localhost:3001/posts/$post_id/likes \
  -b test_cookies.txt \
  -s)

if [[ $like_response == *"いいねしました"* ]]; then
    echo "✅ いいね追加成功"
else
    echo "❌ いいね追加失敗"
    echo "レスポンス: $like_response"
fi

# 5. いいね削除テスト
echo "💔 いいね削除テスト..."
unlike_response=$(curl -X DELETE http://localhost:3001/posts/$post_id/likes \
  -b test_cookies.txt \
  -s)

if [[ $unlike_response == *"いいねを取り消しました"* ]]; then
    echo "✅ いいね削除成功"
else
    echo "❌ いいね削除失敗"
    echo "レスポンス: $unlike_response"
fi

# 6. 認証状態確認
echo "🔍 認証状態確認..."
auth_response=$(curl -s http://localhost:3001/auth/me -b test_cookies.txt)
username=$(echo $auth_response | jq -r '.user.username')
echo "ログインユーザー: $username"

# 7. クリーンアップ
rm -f test_cookies.txt

echo ""
echo "🎉 WebSocketテスト完了！"
echo ""
echo "📋 次の手順でリアルタイム機能を確認してください:"
echo "1. ブラウザで http://localhost:3001 にアクセス"
echo "2. 開発者ツールのコンソールを開く"
echo "3. 以下のコードを実行:"
echo ""
echo "const socket = io('http://localhost:3001/sns', { withCredentials: true });"
echo "socket.on('connect', () => console.log('WebSocket接続成功'));"
echo "socket.on('post:created', data => console.log('新規投稿:', data));"
echo "socket.on('post:liked', data => console.log('いいね:', data));"
echo "socket.on('users:online', data => console.log('オンラインユーザー:', data));"
echo ""
echo "4. 別のターミナルで投稿作成・いいね操作を実行"
echo "5. ブラウザコンソールでリアルタイム通知を確認"
