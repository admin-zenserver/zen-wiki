# Discord OAuth設定手順

Zen WikiでDiscord認証を使用するために、以下の手順でDiscord Applicationを設定してください。

## 1. Discord Developer Portalでアプリケーションを作成

1. [Discord Developer Portal](https://discord.com/developers/applications)にアクセス
2. 「New Application」ボタンをクリック
3. アプリケーション名を入力（例：「Zen Wiki」）
4. 「Create」をクリック

## 2. OAuth2設定

1. 左側のメニューから「OAuth2」→「General」を選択
2. 「Client ID」をコピーして`.env`ファイルの`DISCORD_CLIENT_ID`に設定
3. 「Client Secret」の「Reset Secret」をクリックしてシークレットを生成
4. 生成されたシークレットをコピーして`.env`ファイルの`DISCORD_CLIENT_SECRET`に設定
5. 「Redirects」セクションで「Add Redirect」をクリック
6. リダイレクトURIを追加：
   - 開発環境: `http://localhost:5000/api/auth/callback`
   - 本番環境: `https://your-domain.com/api/auth/callback`

## 3. 環境変数の設定

`.env`ファイルを編集して以下の値を設定：

```env
DISCORD_CLIENT_ID=あなたのクライアントID
DISCORD_CLIENT_SECRET=あなたのクライアントシークレット
DISCORD_REDIRECT_URI=http://localhost:5000/api/auth/callback
ADMIN_DISCORD_IDS=管理者のDiscord ID（カンマ区切り）
EDITOR_DISCORD_IDS=編集者のDiscord ID（カンマ区切り）
```

## 4. Discord IDの取得方法

1. Discordで開発者モードを有効にする：
   - Discord設定 → 詳細設定 → 開発者モード をオン
2. ユーザーを右クリックして「IDをコピー」を選択
3. 取得したIDを環境変数に設定

## 5. 権限設定

- **admin**: すべての機能にアクセス可能（ページ作成・編集・削除、メニュー管理、ユーザー管理）
- **editor**: ページの作成・編集が可能（削除は不可）
- **viewer**: ページの閲覧のみ可能（デフォルト）

## 6. テスト

1. バックエンドサーバーを起動：`python src/main.py`
2. フロントエンドサーバーを起動：`npm run dev`
3. ブラウザで`http://localhost:5174`にアクセス
4. 「Discordでログイン」ボタンをクリックしてテスト

## トラブルシューティング

- **Invalid redirect_uri**: リダイレクトURIがDiscord Applicationの設定と一致しているか確認
- **Invalid client**: Client IDとClient Secretが正しく設定されているか確認
- **Scope error**: OAuth2のスコープが「identify」に設定されているか確認
