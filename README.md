# Zen Wiki - Zenサーバー公式Wiki

Discord認証とコンテンツ管理機能を備えた、モダンなWebベースWikiシステムです。

## 🌟 主な機能

### 📝 コンテンツ管理
- **Markdownエディタ**: リアルタイムプレビュー付きの高機能エディタ
- **ページ管理**: 作成・編集・削除・公開/非公開設定
- **メニュー管理**: 階層構造のナビゲーション
- **検索機能**: タイトルとコンテンツの全文検索
- **履歴管理**: ページ変更履歴の追跡

### 🔐 認証・権限システム
- **Discord OAuth2**: Discordアカウントでのシングルサインオン
- **3段階権限**: ビューア・エディター・管理者
- **権限管理**: 管理者による柔軟な権限設定
- **セキュリティ**: JWT認証とCORS設定

### 🎨 ユーザーインターフェース
- **ダークテーマ**: Zenスタイルの緑色グロー効果
- **レスポンシブデザイン**: モバイル・デスクトップ対応
- **モダンUI**: TailwindCSS + shadcn/ui
- **デモモード**: 認証なしでの機能プレビュー

## 🏗️ システム構成

### フロントエンド
- **React 18** + **Vite**
- **TailwindCSS** + **shadcn/ui**
- **Lucide React** (アイコン)
- **React Markdown** (コンテンツ表示)

### バックエンド
- **Flask** (Python Web Framework)
- **SQLAlchemy** (ORM)
- **SQLite** (データベース)
- **JWT** (認証トークン)
- **Discord OAuth2** (認証プロバイダー)

## 📁 プロジェクト構造

```
zen-wiki-complete/
├── frontend/                 # Reactフロントエンド
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   │   ├── ui/         # shadcn/uiコンポーネント
│   │   │   ├── Layout.jsx  # メインレイアウト
│   │   │   ├── PageViewer.jsx
│   │   │   ├── PageEditor.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── DemoMode.jsx
│   │   ├── hooks/          # カスタムフック
│   │   │   └── useAuth.jsx
│   │   ├── lib/            # ユーティリティ
│   │   │   └── api.js
│   │   └── assets/         # 静的ファイル
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Flaskバックエンド
│   ├── src/
│   │   ├── models/         # データモデル
│   │   │   └── wiki.py
│   │   ├── routes/         # APIルート
│   │   │   ├── auth.py
│   │   │   ├── pages.py
│   │   │   └── menus.py
│   │   └── main.py         # メインアプリケーション
│   ├── requirements.txt
│   └── .env.example
└── README.md
```

## 🚀 セットアップ手順

### 1. Discord OAuth設定

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 新しいアプリケーションを作成
3. OAuth2設定で以下を設定:
   - **Redirect URI**: `http://localhost:5001/api/auth/callback`
   - **Scopes**: `identify`
4. Client IDとClient Secretを取得

### 2. バックエンドセットアップ

```bash
cd backend

# 仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係インストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .envファイルを編集してDiscord認証情報を設定

# データベース初期化
python src/main.py

# サーバー起動
python src/main.py
```

### 3. フロントエンドセットアップ

```bash
cd frontend

# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

### 4. アクセス

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:5001

## ⚙️ 環境変数設定

### バックエンド (.env)

```env
# Discord OAuth設定
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:5001/api/auth/callback

# JWT設定
JWT_SECRET_KEY=your_jwt_secret_key

# 権限設定（Discord ID）
ADMIN_DISCORD_IDS=123456789,987654321
EDITOR_DISCORD_IDS=456789123,789123456

# データベース
DATABASE_URL=sqlite:///wiki.db
```

## 👥 権限システム

### ビューア (viewer)
- ページの閲覧
- 検索機能の利用

### エディター (editor)
- ビューア権限 + 以下
- ページの作成・編集
- メニューの管理
- ページの公開/非公開設定

### 管理者 (admin)
- エディター権限 + 以下
- ユーザー権限管理
- ページの削除
- システム設定
- 管理者パネルへのアクセス

## 🔧 カスタマイズ

### テーマ変更
`frontend/src/App.css`でZenテーマのカラーパレットを変更できます。

### 権限設定
環境変数`ADMIN_DISCORD_IDS`と`EDITOR_DISCORD_IDS`でユーザー権限を設定します。

### データベース
SQLiteからPostgreSQLやMySQLに変更する場合は、`DATABASE_URL`を変更してください。

## 📦 デプロイ

### フロントエンド (Vercel/Netlify)

```bash
cd frontend
npm run build
# distフォルダをデプロイ
```

### バックエンド (Heroku/Railway)

```bash
cd backend
# Procfileを作成
echo "web: python src/main.py" > Procfile
# 環境変数を設定してデプロイ
```

## 🛠️ 開発

### 新機能追加
1. バックエンドAPIを`backend/src/routes/`に追加
2. フロントエンドコンポーネントを`frontend/src/components/`に追加
3. APIクライアントを`frontend/src/lib/api.js`に追加

### データベーススキーマ変更
`backend/src/models/wiki.py`でモデルを変更後、データベースを再初期化してください。

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesページでお知らせください。

---

**Zen Wiki** - Zenサーバーコミュニティの知識を共有しよう 🌟
