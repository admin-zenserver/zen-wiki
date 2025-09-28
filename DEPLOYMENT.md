# Zen Wiki デプロイメント手順書

## 🚀 デプロイオプション

### オプション1: GitHub Pages + Heroku/Railway

#### フロントエンド (GitHub Pages)
1. GitHubリポジトリを作成
2. プロジェクトをプッシュ
3. Settings > Pages > Source を "GitHub Actions" に設定
4. `.github/workflows/deploy.yml` が自動でデプロイを実行

#### バックエンド (Heroku)
```bash
# Heroku CLI インストール後
heroku create zen-wiki-backend
heroku config:set DISCORD_CLIENT_ID=your_client_id
heroku config:set DISCORD_CLIENT_SECRET=your_client_secret
heroku config:set JWT_SECRET_KEY=your_jwt_secret
heroku config:set ADMIN_DISCORD_IDS=123456789,987654321
git subtree push --prefix backend heroku main
```

#### バックエンド (Railway)
1. [Railway](https://railway.app) にログイン
2. "New Project" > "Deploy from GitHub repo"
3. `backend` フォルダを選択
4. 環境変数を設定:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`
   - `JWT_SECRET_KEY`
   - `ADMIN_DISCORD_IDS`
   - `EDITOR_DISCORD_IDS`

### オプション2: Vercel + Supabase

#### フロントエンド (Vercel)
```bash
npm i -g vercel
cd frontend
vercel --prod
```

#### バックエンド (Supabase Edge Functions)
```bash
# Supabase CLI インストール後
supabase init
supabase functions new zen-wiki-api
# backend/src を functions/zen-wiki-api にコピー
supabase functions deploy zen-wiki-api
```

### オプション3: Docker + VPS

#### Dockerファイル作成
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY src/ ./src/
EXPOSE 5001
CMD ["python", "src/main.py"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
      - DISCORD_CLIENT_SECRET=${DISCORD_CLIENT_SECRET}
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    volumes:
      - ./data:/app/data

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## 🔧 環境変数設定

### 必須設定
```env
# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://your-backend-domain.com/api/auth/callback

# JWT
JWT_SECRET_KEY=your_random_secret_key

# 権限設定
ADMIN_DISCORD_IDS=123456789,987654321
EDITOR_DISCORD_IDS=456789123,789123456
```

### フロントエンド設定
```env
# frontend/.env.production
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 🌐 ドメイン設定

### カスタムドメイン使用時
1. DNS設定でCNAMEレコードを追加
2. SSL証明書を設定（Let's Encrypt推奨）
3. Discord OAuth のリダイレクトURIを更新
4. フロントエンドの API_BASE_URL を更新

### 例: zen-wiki.example.com
```
# DNS設定
wiki.example.com CNAME your-frontend-host
api.example.com CNAME your-backend-host

# 環境変数更新
DISCORD_REDIRECT_URI=https://api.example.com/api/auth/callback
VITE_API_BASE_URL=https://api.example.com
```

## 📊 監視・ログ

### ログ設定
```python
# backend/src/main.py に追加
import logging
logging.basicConfig(level=logging.INFO)
```

### ヘルスチェック
- フロントエンド: `https://your-domain.com`
- バックエンド: `https://your-api-domain.com/api/health`

## 🔒 セキュリティ

### 本番環境での推奨設定
1. **HTTPS必須**: SSL証明書の設定
2. **CORS設定**: 本番ドメインのみ許可
3. **JWT有効期限**: 適切な期限設定
4. **レート制限**: API呼び出し制限
5. **データベース**: SQLiteからPostgreSQLに移行

### セキュリティヘッダー
```python
# backend/src/main.py
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response
```

## 🚨 トラブルシューティング

### よくある問題

#### CORS エラー
```python
# backend/src/main.py
CORS(app, origins=['https://your-frontend-domain.com'])
```

#### Discord認証エラー
1. Client ID/Secret の確認
2. リダイレクトURIの一致確認
3. OAuth2 スコープの確認

#### ビルドエラー
```bash
# フロントエンド
rm -rf node_modules package-lock.json
npm install
npm run build

# バックエンド
pip install --upgrade pip
pip install -r requirements.txt
```

## 📈 スケーリング

### 高負荷対応
1. **CDN**: CloudflareやAWS CloudFront
2. **ロードバランサー**: 複数インスタンス
3. **データベース**: PostgreSQL + Redis
4. **キャッシュ**: Redis でセッション管理

### パフォーマンス最適化
1. **フロントエンド**: コード分割、画像最適化
2. **バックエンド**: データベースインデックス、クエリ最適化
3. **API**: レスポンス圧縮、キャッシュヘッダー

---

詳細な設定や問題解決については、各プラットフォームのドキュメントを参照してください。
