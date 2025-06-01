#!/bin/bash

# サーバーの基本情報を確認
echo "Testing basic server connectivity..."
curl -i http://localhost:3001/auth/check

# ヘッダー情報を含めて接続を確認
echo -e "\n\nTesting with auth header..."
curl -i -H "Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWxpY2UiLCJlbWFpbCI6ImFsaWNlQGV4YW1wbGUuY29tIiwiaWF0IjoxNzQ4NzA4ODMxLCJleHAiOjE3NDkzMTM2MzF9.0FcqE0OMBsb2CYp-zyk_hQF6exu1WUvegiO7Oeil77M" \
  http://localhost:3001/auth/me