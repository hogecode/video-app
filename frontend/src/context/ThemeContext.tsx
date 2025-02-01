
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// 既に作成済みの ThemeContextType と ThemeContext を再利用する
// テーマの型（light または dark）
type ThemeMode = 'light' | 'dark';

// 既存の ThemeContextType を再利用する（もし定義済みなら）
interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
}

// もしまだ定義されていなければ、ThemeContext を新規に作成
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider コンポーネント
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   // 初期テーマをローカルストレージまたはデバイスの設定に基づいて決定
   const savedTheme = localStorage.getItem('theme') as ThemeMode | null;
   const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
   
   const initialTheme: ThemeMode = savedTheme || (prefersDarkMode ? 'dark' : 'light');
 
   // テーマの状態管理
   const [theme, setTheme] = useState<ThemeMode>(initialTheme);
 
   // テーマを切り替える関数
   const toggleTheme = () => {
     const newTheme = theme === 'dark' ? 'light' : 'dark';
     setTheme(newTheme);
     localStorage.setItem('theme', newTheme); // ローカルストレージに保存
   };
 
   useEffect(() => {
     // テーマ変更時に、document.body に data-theme を設定
     document.body.setAttribute('data-theme', theme);
   }, [theme]);
 
   return (
     <ThemeContext.Provider value={{ theme, toggleTheme }}>
       {children}
     </ThemeContext.Provider>
   );
 };

// ThemeContext を取得するフック
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};