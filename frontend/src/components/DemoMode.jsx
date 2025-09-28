import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Eye, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { pagesAPI, menusAPI } from '../lib/api';

const DemoMode = ({ onBack }) => {
  const [pages, setPages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagesResponse, menusResponse] = await Promise.all([
          pagesAPI.getPages(),
          menusAPI.getMenus()
        ]);
        setPages(pagesResponse.data);
        setMenus(menusResponse.data);
        
        // デフォルトでホームページを表示
        const homePage = pagesResponse.data.find(page => page.slug === 'home');
        if (homePage) {
          setCurrentPage(homePage);
        }
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageSelect = async (slug) => {
    try {
      const response = await pagesAPI.getPage(slug);
      setCurrentPage(response.data);
    } catch (error) {
      console.error('ページ取得エラー:', error);
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

  return (
    <div className="min-h-screen bg-background zen-gradient">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={onBack}
              className="zen-border-glow"
            >
              <ArrowLeft size={16} className="mr-2" />
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary zen-glow">
                Zen Wiki デモモード
              </h1>
              <p className="text-muted-foreground">
                認証なしでWikiの機能をプレビューできます
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="zen-border-glow">
            <Eye size={14} className="mr-1" />
            閲覧専用
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <Card className="zen-border-glow">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <BookOpen size={20} />
                  ページ一覧
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handlePageSelect(page.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      currentPage?.id === page.id
                        ? 'bg-primary text-primary-foreground zen-glow'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="font-medium text-sm">{page.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(page.updated_at).toLocaleDateString('ja-JP')}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* メニュー構造 */}
            {menus.length > 0 && (
              <Card className="zen-border-glow mt-6">
                <CardHeader>
                  <CardTitle className="text-primary">メニュー構造</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {menus.map((menu) => (
                    <div key={menu.id}>
                      <button
                        onClick={() => menu.page_slug && handlePageSelect(menu.page_slug)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors text-sm"
                      >
                        {menu.title}
                      </button>
                      {menu.children && menu.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => child.page_slug && handlePageSelect(child.page_slug)}
                          className="w-full text-left px-6 py-1 rounded-lg hover:bg-accent transition-colors text-xs text-muted-foreground"
                        >
                          {child.title}
                        </button>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {currentPage ? (
              <Card className="zen-border-glow">
                <CardHeader>
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-primary zen-glow">
                      {currentPage.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>作成者: {currentPage.author}</span>
                      <span>更新: {new Date(currentPage.updated_at).toLocaleString('ja-JP')}</span>
                      <Badge variant="outline">
                        {currentPage.slug}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="markdown-content">
                    <ReactMarkdown>{currentPage.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="zen-border-glow">
                <CardContent className="p-8 text-center">
                  <div className="text-muted-foreground">
                    <BookOpen size={48} className="mx-auto mb-4 text-primary zen-glow" />
                    <h3 className="text-xl font-semibold mb-2">ページを選択してください</h3>
                    <p>左側のページ一覧からページを選択して内容を確認できます。</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* 機能説明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="zen-border-glow">
            <CardContent className="p-6 text-center">
              <BookOpen className="mx-auto mb-4 text-primary zen-glow" size={32} />
              <h3 className="font-semibold mb-2 text-primary">ページ管理</h3>
              <p className="text-sm text-muted-foreground">
                Markdownでページを作成・編集し、リアルタイムプレビューで確認できます。
              </p>
            </CardContent>
          </Card>

          <Card className="zen-border-glow">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 text-primary zen-glow w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-primary">権限管理</h3>
              <p className="text-sm text-muted-foreground">
                Discord認証による3段階の権限システムで安全にコンテンツを管理できます。
              </p>
            </CardContent>
          </Card>

          <Card className="zen-border-glow">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 text-primary zen-glow w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2 text-primary">メニュー管理</h3>
              <p className="text-sm text-muted-foreground">
                階層構造のメニューを作成し、ドラッグ&ドロップで簡単に並び替えできます。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;
