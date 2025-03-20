//Fix: @/インポートがなぜかreactではできない

import { SettingsProvider } from 'context/SettingsContext';
import { VideoProvider } from 'context/VideoContext';
import Settings from 'pages/Settings';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

import { ThemeProvider, useTheme } from './context/ThemeContext'; // ThemeContext のインポート
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Video from './pages/Video';

// Fix: font faceが読み込めないので一時的にコメントアウト
// import './styles/index.scss';
// import './styles/index.css'


// App コンポーネント
const App: React.FC = () => {
  return (
    <ThemeProvider> {/* ThemeContext を提供 */}
     <VideoProvider>
      <SettingsProvider>
      <AppWithTheme />
      </SettingsProvider>
      </VideoProvider>
    </ThemeProvider>
  );
};

// テーマ設定を動的に変更するコンポーネント
const AppWithTheme: React.FC = () => {
  const { theme: mode } = useTheme(); // ThemeContext からテーマモードを取得

 // ダークモードとライトモードのテーマ設定
 const theme = createTheme({
  palette: {
    mode: mode, // 'light' または 'dark' モードを動的に設定
    primary: {
      main: '#1976d2', 
    },
    secondary: {
      main: '#9c27b0', 
    },
    background: {
      default: mode === 'dark' ? '#303030' : '#f5f5f5', // ダークモード時とライトモード時の背景色
      paper: mode === 'dark' ? '#424242' : '#ffffff', // 紙の色（カードやダイアログの背景）
    },
    text: {
      primary: mode === 'dark' ? '#e0e0e0' : '#000000', // ダークモードとライトモードのテキスト色
      secondary: mode === 'dark' ? '#b0b0b0' : '#757575', // 二次的なテキスト色
    },
  },
});

  return (
    <MuiThemeProvider theme={theme}> {/* MUI ThemeProvider にテーマを渡す */}
    <>
    <CssBaseline/>
      <Router>
        <Routes>
          {/* 一覧画面 */}
          <Route path="/" element={<Home />} />

          {/* 動的ルート */}
          <Route path="/videos/:videoId" element={<Video />} />

          {/* 設定画面 */}
          <Route path="/settings" element={<Settings />} />

          {/* 404ページ */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      </>
    </MuiThemeProvider>
  );
};

export default App;