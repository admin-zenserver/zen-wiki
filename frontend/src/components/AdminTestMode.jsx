import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Crown, Edit3, Eye, Shield } from 'lucide-react';
import AdminPanel from './AdminPanel';

const AdminTestMode = ({ onBack }) => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');

  // モックユーザーデータ
  const mockUsers = {
    admin: {
      id: 1,
      discord_id: '123456789',
      username: 'Admin User',
      role: 'admin',
      avatar_url: null
    },
    editor: {
      id: 2,
      discord_id: '987654321',
      username: 'Editor User',
      role: 'editor',
      avatar_url: null
    },
    viewer: {
      id: 3,
      discord_id: '456789123',
      username: 'Viewer User',
      role: 'viewer',
      avatar_url: null
    }
  };

  // モック認証フック
  const mockAuth = {
    user: mockUsers[selectedRole],
    isAuthenticated: true,
    hasRole: (requiredRole) => {
      const roleHierarchy = { viewer: 0, editor: 1, admin: 2 };
      const userRoleLevel = roleHierarchy[selectedRole] || 0;
      const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
      return userRoleLevel >= requiredRoleLevel;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="text-yellow-500" size={16} />;
      case 'editor':
        return <Edit3 className="text-blue-500" size={16} />;
      case 'viewer':
        return <Eye className="text-gray-500" size={16} />;
      default:
        return null;
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

  if (showAdminPanel) {
    // AdminPanelコンポーネントに一時的にモック認証を注入
    return (
      <div>
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
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
                管理者権限システム テスト
              </h1>
              <p className="text-muted-foreground">
                異なる権限レベルでの機能をテストできます
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="zen-border-glow">
            <Shield size={14} className="mr-1" />
            テストモード
          </Badge>
        </div>

        {/* 権限選択 */}
        <Card className="zen-border-glow mb-8">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Shield size={20} />
              テスト用権限選択
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(mockUsers).map(([role, user]) => (
                <div
                  key={role}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedRole === role
                      ? 'border-primary bg-primary/10 zen-border-glow'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {user.username.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.username}
                        {getRoleIcon(role)}
                      </div>
                      <Badge variant={getRoleBadgeVariant(role)} className="text-xs">
                        {role}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div className="font-medium mb-1">権限:</div>
                    <ul className="space-y-1 text-xs">
                      {role === 'viewer' && (
                        <li>• ページの閲覧のみ</li>
                      )}
                      {role === 'editor' && (
                        <>
                          <li>• ページの閲覧</li>
                          <li>• ページの作成・編集</li>
                          <li>• メニューの管理</li>
                        </>
                      )}
                      {role === 'admin' && (
                        <>
                          <li>• 全ての機能にアクセス</li>
                          <li>• ユーザー権限管理</li>
                          <li>• システム設定</li>
                          <li>• ページ削除</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 現在の権限状態 */}
        <Card className="zen-border-glow mb-8">
          <CardHeader>
            <CardTitle className="text-primary">現在のテスト状態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-lg">
                    {mockUsers[selectedRole].username.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {mockUsers[selectedRole].username}
                    {getRoleIcon(selectedRole)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Discord ID: {mockUsers[selectedRole].discord_id}
                  </div>
                  <Badge variant={getRoleBadgeVariant(selectedRole)} className="mt-1">
                    {selectedRole}
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-2">利用可能な機能:</div>
                <div className="space-y-1 text-xs">
                  <div className={mockAuth.hasRole('viewer') ? 'text-green-500' : 'text-gray-400'}>
                    ✓ ページ閲覧
                  </div>
                  <div className={mockAuth.hasRole('editor') ? 'text-green-500' : 'text-gray-400'}>
                    {mockAuth.hasRole('editor') ? '✓' : '✗'} ページ編集
                  </div>
                  <div className={mockAuth.hasRole('admin') ? 'text-green-500' : 'text-gray-400'}>
                    {mockAuth.hasRole('admin') ? '✓' : '✗'} 管理者パネル
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        <div className="flex justify-center gap-4">
          {mockAuth.hasRole('admin') ? (
            <Button
              onClick={() => setShowAdminPanel(true)}
              className="zen-glow"
              size="lg"
            >
              <Shield size={20} className="mr-2" />
              管理者パネルを開く
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              size="lg"
            >
              <Shield size={20} className="mr-2" />
              管理者パネル（権限不足）
            </Button>
          )}
        </div>

        {/* 権限説明 */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="zen-border-glow">
            <CardContent className="p-6 text-center">
              <Eye className="mx-auto mb-4 text-gray-500" size={32} />
              <h3 className="font-semibold mb-2 text-primary">ビューア</h3>
              <p className="text-sm text-muted-foreground">
                ページの閲覧のみ可能。編集や管理機能は利用できません。
              </p>
            </CardContent>
          </Card>

          <Card className="zen-border-glow">
            <CardContent className="p-6 text-center">
              <Edit3 className="mx-auto mb-4 text-blue-500" size={32} />
              <h3 className="font-semibold mb-2 text-primary">エディター</h3>
              <p className="text-sm text-muted-foreground">
                ページの作成・編集・メニュー管理が可能。ユーザー管理は不可。
              </p>
            </CardContent>
          </Card>

          <Card className="zen-border-glow">
            <CardContent className="p-6 text-center">
              <Crown className="mx-auto mb-4 text-yellow-500" size={32} />
              <h3 className="font-semibold mb-2 text-primary">管理者</h3>
              <p className="text-sm text-muted-foreground">
                全ての機能にアクセス可能。ユーザー権限管理とシステム設定も可能。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTestMode;
