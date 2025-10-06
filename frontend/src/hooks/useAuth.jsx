import { useState, useEffect, createContext, useContext } from 'react';
import { authAPI } from '../lib/api';

// 認証コンテキストを作成
const AuthContext = createContext();

// 認証プロバイダーコンポーネント
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初期化時にトークンをチェック
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('zen_wiki_token');
      
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('認証エラー:', error);
          localStorage.removeItem('zen_wiki_token');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // URLからトークンを取得（Discord認証後のリダイレクト）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      localStorage.setItem('zen_wiki_token', token);
      // URLからトークンパラメータを削除
      window.history.replaceState({}, document.title, window.location.pathname);
      // ユーザー情報を再取得
      window.location.reload();
    }
  }, []);

  // ログイン関数
  const login = async () => {
    try {
      const response = await authAPI.getDiscordAuthUrl();
      window.location.href = response.data.auth_url;
    } catch (error) {
      console.error('ログインエラー:', error);
      throw error;
    }
  };

  // ログアウト関数
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('ログアウトエラー:', error);
    } finally {
      localStorage.removeItem('zen_wiki_token');
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/';
    }
  };

  // 権限チェック関数
  const hasRole = (requiredRole) => {
    if (!user) return false;
    
    const roleHierarchy = { viewer: 0, editor: 1, admin: 2 };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    return userRoleLevel >= requiredRoleLevel;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 認証フックを使用するためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

