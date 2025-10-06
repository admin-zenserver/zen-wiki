import axios from 'axios';

// APIベースURL（開発環境では相対パス、本番環境では適切なURLに変更）
const API_BASE_URL = 'http://localhost:5001/api';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンを自動で追加）
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('zen_wiki_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、トークンを削除してログイン画面にリダイレクト
      localStorage.removeItem('zen_wiki_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authAPI = {
  // Discord認証URLを取得
  getDiscordAuthUrl: () => api.get('/auth/discord'),
  
  // 現在のユーザー情報を取得
  getCurrentUser: () => api.get('/auth/me'),
  
  // ログアウト
  logout: () => api.post('/auth/logout'),
};

// ページ関連のAPI
export const pagesAPI = {
  // ページ一覧を取得
  getPages: () => api.get('/pages'),
  
  // 特定のページを取得
  getPage: (slug) => api.get(`/pages/${slug}`),
  
  // ページを作成
  createPage: (pageData) => api.post('/pages', pageData),
  
  // ページを更新
  updatePage: (pageId, pageData) => api.put(`/pages/${pageId}`, pageData),
  
  // ページを削除
  deletePage: (pageId) => api.delete(`/pages/${pageId}`),
  
  // ページの履歴を取得
  getPageHistory: (pageId) => api.get(`/pages/${pageId}/history`),
  
  // ページを検索
  searchPages: (query) => api.get(`/pages/search?q=${encodeURIComponent(query)}`),
};

// メニュー関連のAPI
export const menusAPI = {
  // メニュー構造を取得
  getMenus: () => api.get('/menus'),
  
  // メニュー項目を作成
  createMenu: (menuData) => api.post('/menus', menuData),
  
  // メニュー項目を更新
  updateMenu: (menuId, menuData) => api.put(`/menus/${menuId}`, menuData),
  
  // メニュー項目を削除
  deleteMenu: (menuId) => api.delete(`/menus/${menuId}`),
  
  // メニューの順序を変更
  reorderMenus: (menuOrders) => api.put('/menus/reorder', { menus: menuOrders }),
  
  // メニュー項目を移動
  moveMenu: (menuId, moveData) => api.put(`/menus/${menuId}/move`, moveData),
};

// ヘルスチェック
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;

