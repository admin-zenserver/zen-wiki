import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Menu, 
  Search, 
  User, 
  LogOut, 
  Settings, 
  Plus,
  Home,
  BookOpen,
  Edit3
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { menusAPI, pagesAPI } from '../lib/api';
import zenLogo from '../assets/zen-logo.jpg';

const Layout = ({ children, currentPage, onPageChange, onCreatePage, onOpenAdminPanel }) => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menus, setMenus] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // メニューデータを取得
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await menusAPI.getMenus();
        setMenus(response.data);
      } catch (error) {
        console.error('メニュー取得エラー:', error);
      }
    };

    fetchMenus();
  }, []);

  // 検索機能
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      try {
        const response = await pagesAPI.searchPages(query);
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (error) {
        console.error('検索エラー:', error);
        setSearchResults([]);
      }
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  };

  // メニュー項目をレンダリング
  const renderMenuItem = (menu, level = 0) => (
    <div key={menu.id} className={`ml-${level * 4}`}>
      <button
        onClick={() => menu.page_slug && onPageChange(menu.page_slug)}
        className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 ${
          currentPage === menu.page_slug ? 'bg-primary text-primary-foreground' : ''
        }`}
      >
        {level === 0 ? <BookOpen size={16} /> : <div className="w-4" />}
        <span className="text-sm">{menu.title}</span>
      </button>
      {menu.children && menu.children.map(child => renderMenuItem(child, level + 1))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* サイドバー */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-card border-r border-border flex flex-col`}>
        {/* ヘッダー */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={zenLogo} alt="Zen Logo" className="w-8 h-8 rounded" />
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-primary">Zen Wiki</h1>
                <p className="text-xs text-muted-foreground">Zenサーバー公式Wiki</p>
              </div>
            )}
          </div>
        </div>

        {/* 検索バー */}
        {sidebarOpen && (
          <div className="p-4 border-b border-border relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="ページを検索..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 検索結果 */}
            {showSearchResults && (
              <div className="absolute top-full left-4 right-4 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => {
                        onPageChange(page.slug);
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                    >
                      <div className="font-medium text-sm">{page.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {page.content.substring(0, 100)}...
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    検索結果が見つかりません
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ナビゲーション */}
        <div className="flex-1 p-4 space-y-2">
          {sidebarOpen && (
            <>
              <button
                onClick={() => onPageChange('home')}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 ${
                  currentPage === 'home' ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Home size={16} />
                <span className="text-sm">ホーム</span>
              </button>
              
              {/* 動的メニュー */}
              {menus.map(menu => renderMenuItem(menu))}
              
              {/* 編集者以上の権限を持つユーザーに新規ページ作成ボタンを表示 */}
              {hasRole('editor') && (
                <button
                  onClick={onCreatePage}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent transition-colors flex items-center gap-2 text-primary"
                >
                  <Plus size={16} />
                  <span className="text-sm">新しいページ</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* ユーザー情報 */}
        {isAuthenticated && user && (
          <div className="p-4 border-t border-border">
            {sidebarOpen ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-accent">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User size={16} className="text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.username}</div>
                    <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  </div>
                </div>
                {hasRole('admin') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onOpenAdminPanel}
                    className="w-full justify-start"
                  >
                    <Settings size={16} className="mr-2" />
                    管理者パネル
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start"
                >
                  <LogOut size={16} className="mr-2" />
                  ログアウト
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="w-full p-2"
              >
                <LogOut size={16} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* トップバー */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={20} />
            </Button>
            
            {currentPage && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Home size={16} />
                <span>/</span>
                <span className="capitalize">{currentPage}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Button variant="outline" size="sm">
                ログイン
              </Button>
            )}
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

