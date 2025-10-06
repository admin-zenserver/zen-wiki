import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Edit3, 
  Eye, 
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

const UserRoleDialog = ({ user, onClose, onSave }) => {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      value: 'viewer',
      label: 'ビューア',
      description: 'ページの閲覧のみ可能',
      icon: <Eye size={16} />,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      value: 'editor',
      label: 'エディター',
      description: 'ページの作成・編集・メニュー管理が可能',
      icon: <Edit3 size={16} />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900'
    },
    {
      value: 'admin',
      label: '管理者',
      description: '全ての機能にアクセス可能',
      icon: <Crown size={16} />,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900'
    }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(user.id, selectedRole);
      onClose();
    } catch (error) {
      console.error('権限更新エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (roleValue) => {
    return roles.find(role => role.value === roleValue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="zen-border-glow max-w-md w-full mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary flex items-center gap-2">
              <Edit3 size={20} />
              ユーザー権限編集
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ユーザー情報 */}
          <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-lg">
                {user.username.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-muted-foreground">
                Discord ID: {user.discord_id}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">現在の権限:</span>
                <Badge variant={user.role === 'admin' ? 'default' : user.role === 'editor' ? 'secondary' : 'outline'}>
                  {getRoleInfo(user.role)?.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* 権限選択 */}
          <div className="space-y-3">
            <h3 className="font-semibold text-primary">新しい権限を選択</h3>
            {roles.map((role) => (
              <div
                key={role.value}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRole === role.value
                    ? 'border-primary bg-primary/10 zen-border-glow'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedRole(role.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${role.bgColor}`}>
                      <span className={role.color}>
                        {role.icon}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {role.label}
                        {selectedRole === role.value && (
                          <Check className="text-primary" size={16} />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 警告メッセージ */}
          {selectedRole === 'admin' && user.role !== 'admin' && (
            <div className="flex items-start gap-3 p-4 border border-yellow-500/20 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="text-yellow-500 mt-0.5" size={16} />
              <div className="text-sm">
                <div className="font-medium text-yellow-600 dark:text-yellow-400">
                  管理者権限の付与
                </div>
                <div className="text-muted-foreground">
                  このユーザーは全ての機能にアクセスできるようになります。
                  他のユーザーの権限変更や削除も可能になります。
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading || selectedRole === user.role}
              className="zen-glow"
            >
              {loading ? '更新中...' : '権限を更新'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleDialog;
