import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit3, Clock, User, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth.jsx';
import { pagesAPI } from '../lib/api';

const PageViewer = ({ slug, onEdit, onDelete }) => {
  const { hasRole } = useAuth();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await pagesAPI.getPage(slug);
        setPage(response.data);
      } catch (error) {
        console.error('ページ取得エラー:', error);
        setError(error.response?.data?.error || 'ページの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="zen-border-glow">
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            <h2 className="text-xl font-semibold">エラー</h2>
            <p className="text-sm mt-2">{error}</p>
          </div>
          {hasRole('editor') && (
            <Button onClick={() => onEdit(null)} className="zen-glow">
              新しいページを作成
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!page) {
    return (
      <Card className="zen-border-glow">
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground mb-4">
            <h2 className="text-xl font-semibold">ページが見つかりません</h2>
            <p className="text-sm mt-2">指定されたページは存在しないか、削除された可能性があります。</p>
          </div>
          {hasRole('editor') && (
            <Button onClick={() => onEdit(null)} className="zen-glow">
              新しいページを作成
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <Card className="zen-border-glow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold text-primary zen-glow">
                {page.title}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>作成者: {page.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>更新: {formatDate(page.updated_at)}</span>
                </div>
              </div>
            </div>
            
            {/* 編集・削除ボタン */}
            {hasRole('editor') && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(page)}
                  className="zen-border-glow"
                >
                  <Edit3 size={16} className="mr-2" />
                  編集
                </Button>
                {hasRole('admin') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(page)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    削除
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* ページコンテンツ */}
      <Card className="zen-border-glow">
        <CardContent className="p-8">
          <div className="markdown-content">
            <ReactMarkdown>{page.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* ページ情報 */}
      <Card className="zen-border-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              作成日: {formatDate(page.created_at)}
            </div>
            <div>
              スラッグ: <code className="bg-muted px-2 py-1 rounded">{page.slug}</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageViewer;

