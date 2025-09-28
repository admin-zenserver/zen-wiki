import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { pagesAPI } from '../lib/api';

const PageEditor = ({ page, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ページデータを初期化
  useEffect(() => {
    if (page) {
      setTitle(page.title || '');
      setSlug(page.slug || '');
      setContent(page.content || '');
    } else {
      setTitle('');
      setSlug('');
      setContent('');
    }
  }, [page]);

  // タイトルからスラッグを自動生成
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[-\s]+/g, '-')
      .trim();
  };

  // タイトル変更時にスラッグを自動更新（新規作成時のみ）
  const handleTitleChange = (newTitle) => {
    setTitle(newTitle);
    if (!page) { // 新規作成時のみ
      setSlug(generateSlug(newTitle));
    }
  };

  // 保存処理
  const handleSave = async () => {
    if (!title.trim()) {
      setError('タイトルは必須です');
      return;
    }

    if (!slug.trim()) {
      setError('スラッグは必須です');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const pageData = {
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
      };

      let response;
      if (page) {
        // 既存ページの更新
        response = await pagesAPI.updatePage(page.id, pageData);
      } else {
        // 新規ページの作成
        response = await pagesAPI.createPage(pageData);
      }

      onSave(response.data);
    } catch (error) {
      console.error('保存エラー:', error);
      setError(error.response?.data?.error || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* エディターヘッダー */}
      <Card className="zen-border-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-primary">
              {page ? 'ページを編集' : '新しいページを作成'}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="zen-glow"
              >
                <Save size={16} className="mr-2" />
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                <X size={16} className="mr-2" />
                キャンセル
              </Button>
            </div>
          </div>
          {error && (
            <div className="text-destructive text-sm mt-2">
              {error}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* ページ情報入力 */}
      <Card className="zen-border-glow">
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">タイトル *</label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="ページタイトルを入力..."
                className="zen-border-glow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">スラッグ *</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
                className="zen-border-glow"
              />
              <p className="text-xs text-muted-foreground">
                URL用の識別子（英数字とハイフンのみ）
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* コンテンツエディター */}
      <Card className="zen-border-glow">
        <CardContent className="p-0">
          <Tabs defaultValue="edit" className="w-full">
            <div className="border-b border-border px-6 py-2">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Edit3 size={16} />
                  編集
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye size={16} />
                  プレビュー
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="edit" className="p-6 m-0">
              <div className="space-y-2">
                <label className="text-sm font-medium">コンテンツ（Markdown）</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Markdownでコンテンツを入力してください..."
                  className="min-h-96 font-mono zen-border-glow"
                />
                <div className="text-xs text-muted-foreground">
                  Markdown記法が使用できます。# 見出し、**太字**、*斜体*、`コード`、リンク、リストなど
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="p-6 m-0">
              <div className="min-h-96 border border-border rounded-lg p-4">
                {content ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-12">
                    プレビューするコンテンツがありません
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* ヘルプ */}
      <Card className="zen-border-glow">
        <CardContent className="p-4">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-primary mb-2">
              Markdown記法ヘルプ
            </summary>
            <div className="space-y-2 text-muted-foreground">
              <div><code># 見出し1</code> → <strong>大見出し</strong></div>
              <div><code>## 見出し2</code> → <strong>中見出し</strong></div>
              <div><code>**太字**</code> → <strong>太字</strong></div>
              <div><code>*斜体*</code> → <em>斜体</em></div>
              <div><code>`コード`</code> → <code>インラインコード</code></div>
              <div><code>- リスト項目</code> → 箇条書きリスト</div>
              <div><code>1. 番号付きリスト</code> → 番号付きリスト</div>
              <div><code>[リンクテキスト](URL)</code> → リンク</div>
              <div><code>&gt; 引用</code> → 引用ブロック</div>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default PageEditor;

