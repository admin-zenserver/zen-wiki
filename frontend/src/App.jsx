import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, BookOpen, Users, Shield, Eye } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Layout from './components/Layout';
import PageViewer from './components/PageViewer';
import PageEditor from './components/PageEditor';
import DemoMode from './components/DemoMode';
import AdminPanel from './components/AdminPanel';
import AdminTestMode from './components/AdminTestMode';
import './App.css';

// メインアプリケーションコンポーネント
const WikiApp = () => {
  const { isAuthenticated, loading, login } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [editingPage, setEditingPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminTest, setShowAdminTest] = useState(false);

  // ページ変更ハンドラー
  const handlePageChange = (slug) => {
    setCurrentPage(slug);
    setIsEditing(false);
    setEditingPage(null);
  };

  // ページ編集開始
  const handleEditPage = (page) => {
    setEditingPage(page);
    setIsEditing(true);
  };

  // 新規ページ作成
  const handleCreatePage = () => {
    setEditingPage(null);
    setIsEditing(true);
  };

  // ページ保存
  const handleSavePage = (savedPage) => {
    setIsEditing(false);
    setEditingPage(null);
    setCurrentPage(savedPage.slug);
  };

  // 編集キャンセル
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingPage(null);
  };

  // ページ削除
  const handleDeletePage = async (page) => {
    if (window.confirm(`「${page.title}」を削除してもよろしいですか？`)) {
      try {
        // ここで削除APIを呼び出す
        console.log('ページ削除:', page);
        // 削除後はホームページに戻る
        setCurrentPage('home');
      } catch (error) {
        console.error('削除エラー:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 管理者テストモード表示
  if (showAdminTest) {
    return <AdminTestMode onBack={() => setShowAdminTest(false)} />;
  }

  // 管理者パネル表示
  if (showAdminPanel) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  // デモモード表示
  if (showDemo) {
    return <DemoMode onBack={() => setShowDemo(false)} />;
  }

  // 未認証時のランディングページ
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background zen-gradient">
        <div className="container mx-auto px-4 py-16">
          {/* ヘッダー */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-primary mb-4 zen-glow">
              Zen Wiki
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Zenサーバー公式Wiki - コミュニティの知識を共有しよう
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={login}
                size="lg" 
                className="zen-glow text-lg px-8 py-3"
              >
                <LogIn className="mr-2" size={20} />
                Discordでログイン
              </Button>
              <Button 
                onClick={() => setShowDemo(true)}
                variant="outline"
                size="lg" 
                className="zen-border-glow text-lg px-8 py-3"
              >
                <Eye className="mr-2" size={20} />
                デモを見る
              </Button>
              <Button 
                onClick={() => setShowAdminTest(true)}
                variant="outline"
                size="lg" 
                className="zen-border-glow text-lg px-8 py-3"
              >
                <Shield className="mr-2" size={20} />
                管理者テスト
              </Button>
            </div>
          </div>

          {/* 機能紹介 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="zen-border-glow">
              <CardHeader className="text-center">
                <BookOpen className="mx-auto mb-4 text-primary zen-glow" size={48} />
                <CardTitle className="text-primary">知識の共有</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  サーバールール、建築ガイド、イベント情報など、
                  コミュニティの重要な情報を整理して共有できます。
                </p>
              </CardContent>
            </Card>

            <Card className="zen-border-glow">
              <CardHeader className="text-center">
                <Users className="mx-auto mb-4 text-primary zen-glow" size={48} />
                <CardTitle className="text-primary">協力編集</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Discord認証により、信頼できるメンバーが
                  協力してWikiの内容を編集・更新できます。
                </p>
              </CardContent>
            </Card>

            <Card className="zen-border-glow">
              <CardHeader className="text-center">
                <Shield className="mx-auto mb-4 text-primary zen-glow" size={48} />
                <CardTitle className="text-primary">権限管理</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  閲覧者、編集者、管理者の3段階の権限で、
                  適切なアクセス制御を実現します。
                </p>
              </CardContent>
            </Card>
          </div>

          {/* フッター */}
          <div className="text-center mt-16 text-muted-foreground">
            <p>© 2024 Zen Server. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // 認証済みユーザー向けのWiki
  return (
    <Layout
      currentPage={currentPage}
      onPageChange={handlePageChange}
      onEditPage={handleEditPage}
      onNewPage={handleNewPage}
      onOpenAdminPanel={() => setShowAdminPanel(true)}
    >
      {isEditing ? (
        <PageEditor
          page={editingPage}
          onSave={handleSavePage}
          onCancel={handleCancelEdit}
        />
      ) : (
        <PageViewer
          slug={currentPage}
          onEdit={handleEditPage}
          onDelete={handleDeletePage}
        />
      )}
    </Layout>
  );
};

// アプリケーションのルートコンポーネント
function App() {
  return (
    <AuthProvider>
      <WikiApp />
    </AuthProvider>
  );
}

export default App;
