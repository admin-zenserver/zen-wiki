import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Settings, 
  Shield, 
  Trash2, 
  Edit3, 
  Plus,
  Search,
  Crown,
  UserCheck,
  Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import UserRoleDialog from './UserRoleDialog';

const AdminPanel = ({ onClose }) => {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  // 管理者権限チェック
  if (!hasRole('admin')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="zen-border-glow max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 text-destructive" size={48} />
            <h2 className="text-xl font-semibold mb-2">アクセス拒否</h2>
            <p className="text-muted-foreground mb-4">
              この機能は管理者のみアクセス可能です。
            </p>
            <Button onClick={onClose} variant="outline">
              戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 実際のAPIコールに置き換える
        setUsers([
          {
            id: 1,
            discord_id: '123456789',
            username: 'Admin User',
            role: 'admin',
            last_login: '2025-09-25T16:58:36.648490',
            ip_address: '192.168.1.1'
          },
          {
            id: 2,
            discord_id: '987654321',
            username: 'Editor User',
            role: 'editor',
            last_login: '2025-09-25T15:30:00.000000',
            ip_address: '192.168.1.2'
          },
          {
            id: 3,
            discord_id: '456789123',
            username: 'Viewer User',
            role: 'viewer',
            last_login: '2025-09-25T14:15:00.000000',
            ip_address: '192.168.1.3'
          }
        ]);
        
        setPages([
          { id: 1, title: 'ホーム', slug: 'home', author: 'System Admin', is_published: true },
          { id: 2, title: 'サーバールール', slug: 'rules', author: 'System Admin', is_published: true }
        ]);
        
        setMenus([
          { id: 1, title: 'ホーム', page_slug: 'home', order_index: 0 },
          { id: 2, title: 'サーバールール', page_slug: 'rules', order_index: 1 }
        ]);
      } catch (error) {
        console.error('データ取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="text-yellow-500" size={16} />;
      case 'editor':
        return <Edit3 className="text-blue-500" size={16} />;
      case 'viewer':
        return <Eye className="text-gray-500" size={16} />;
      default:
        return <UserCheck className="text-gray-500" size={16} />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.discord_id.includes(searchQuery)
  );

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      // 実際のAPIコールに置き換える
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      console.log(`ユーザー ${userId} の権限を ${newRole} に更新しました`);
    } catch (error) {
      console.error('権限更新エラー:', error);
      throw error;
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
              onClick={onClose}
              className="zen-border-glow"
            >
              戻る
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-primary zen-glow flex items-center gap-2">
                <Shield size={32} />
                管理者パネル
              </h1>
              <p className="text-muted-foreground">
                システム管理とユーザー権限の設定
              </p>
            </div>
          </div>
          <Badge variant="default" className="zen-border-glow">
            <Crown size={14} className="mr-1" />
            管理者
          </Badge>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users size={16} />
              ユーザー
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Edit3 size={16} />
              コンテンツ
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              設定
            </TabsTrigger>
          </TabsList>

          {/* ユーザー管理 */}
          <TabsContent value="users" className="space-y-6">
            <Card className="zen-border-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Users size={20} />
                    ユーザー管理
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input
                        placeholder="ユーザーを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 zen-border-glow"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg zen-border-glow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold">
                            {user.username.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            {getRoleIcon(user.role)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Discord ID: {user.discord_id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            最終ログイン: {new Date(user.last_login).toLocaleString('ja-JP')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit3 size={14} className="mr-1" />
                          編集
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* コンテンツ管理 */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ページ管理 */}
              <Card className="zen-border-glow">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Edit3 size={20} />
                    ページ管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground">
                          /{page.slug} - {page.author}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={page.is_published ? 'default' : 'secondary'}>
                          {page.is_published ? '公開' : '非公開'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full zen-glow">
                    <Plus size={16} className="mr-2" />
                    新しいページ
                  </Button>
                </CardContent>
              </Card>

              {/* メニュー管理 */}
              <Card className="zen-border-glow">
                <CardHeader>
                  <CardTitle className="text-primary flex items-center gap-2">
                    <Settings size={20} />
                    メニュー管理
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {menus.map((menu) => (
                    <div
                      key={menu.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{menu.title}</div>
                        <div className="text-sm text-muted-foreground">
                          順序: {menu.order_index}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit3 size={14} />
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full zen-glow">
                    <Plus size={16} className="mr-2" />
                    新しいメニュー
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* システム設定 */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="zen-border-glow">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Settings size={20} />
                  システム設定
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary">Discord設定</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Client ID</label>
                      <Input 
                        placeholder="Discord Client ID"
                        className="zen-border-glow"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">リダイレクトURI</label>
                      <Input 
                        placeholder="http://localhost:5000/api/auth/callback"
                        className="zen-border-glow"
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-primary">権限設定</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">管理者Discord ID</label>
                      <Input 
                        placeholder="カンマ区切りで入力"
                        className="zen-border-glow"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">編集者Discord ID</label>
                      <Input 
                        placeholder="カンマ区切りで入力"
                        className="zen-border-glow"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button className="zen-glow">
                    設定を保存
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ユーザー権限編集ダイアログ */}
      {editingUser && (
        <UserRoleDialog
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleRoleUpdate}
        />
      )}
    </div>
  );
};

export default AdminPanel;
