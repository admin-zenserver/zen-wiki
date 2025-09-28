#!/bin/bash

echo "🚀 Zen Wiki セットアップスクリプト"
echo "=================================="

# バックエンドセットアップ
echo "📦 バックエンドセットアップ中..."
cd backend

# 仮想環境作成
if [ ! -d "venv" ]; then
    echo "仮想環境を作成中..."
    python -m venv venv
fi

# 仮想環境をアクティベート
source venv/bin/activate

# 依存関係インストール
echo "依存関係をインストール中..."
pip install -r requirements.txt

# 環境変数ファイル作成
if [ ! -f ".env" ]; then
    echo "環境変数ファイルを作成中..."
    cp .env.example .env
    echo "⚠️  .envファイルを編集してDiscord OAuth設定を行ってください"
fi

echo "✅ バックエンドセットアップ完了"

# フロントエンドセットアップ
cd ../frontend
echo "📦 フロントエンドセットアップ中..."

# 依存関係インストール（node_modulesが存在しない場合のみ）
if [ ! -d "node_modules" ]; then
    echo "依存関係をインストール中..."
    npm install
fi

# 環境変数ファイル作成
if [ ! -f ".env" ]; then
    echo "環境変数ファイルを作成中..."
    cp .env.example .env
fi

echo "✅ フロントエンドセットアップ完了"

cd ..

echo ""
echo "🎉 セットアップ完了！"
echo ""
echo "次の手順:"
echo "1. backend/.envファイルを編集してDiscord OAuth設定を行う"
echo "2. バックエンド起動: cd backend && source venv/bin/activate && python src/main.py"
echo "3. フロントエンド起動: cd frontend && npm run dev"
echo "4. ブラウザで http://localhost:5173 にアクセス"
echo ""
echo "詳細な設定方法はREADME.mdを参照してください。"
