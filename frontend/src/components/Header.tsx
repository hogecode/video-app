import { useTheme } from 'context/ThemeContext';
import UseFetch from 'hooks/UseFetch';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
    ArrowBack, ArrowForward, Brightness4, Brightness7, Home, Refresh, Settings
} from '@mui/icons-material';
// eslint-disable-next-line
import { Box, IconButton } from '@mui/material';

const Header: React.FC = () => {
  const navigate = useNavigate(); // useNavigateフックを使って遷移操作を行う

  const { theme, toggleTheme } = useTheme();

  const handleGoHome = () => {
    navigate('/'); // /（ホーム）ページにリダイレクト
  }; // Add missing closing brace

  // 前へボタンのクリック処理
  const handleGoBack = () => {
    navigate(-1); // 履歴の1つ前のページへ遷移
  };

  // 後ろへボタンのクリック処理
  const handleGoForward = () => {
    navigate(1); // 履歴の1つ先のページへ遷移
  };

  const refreshFiles = async () => {
    try {
      const response = await UseFetch<any>('/api/files/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}), // 空のbodyを送信
      });
      if (response.success) {
        console.log('Files refreshed successfully!');
      } else {
        console.log('Failed to refresh files.');
      }
    } catch (error) {
      console.error('Error refreshing files:', error);
    }
  };

  const refreshFilesAndNavigate = async () => {
    await refreshFiles(); // ファイルをリフレッシュ
    handleGoHome(); // ホームページにリダイレクト
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between', // 左右の要素を分ける
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: 'black', //'gray',
        color: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* 左側: 前へ、後ろへボタン */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleGoHome} sx={{ color: 'white' }}>
          <Home /> {/* Homeアイコン */}
        </IconButton>
        <IconButton onClick={refreshFilesAndNavigate} sx={{ color: 'white' }}>
          <Refresh />
        </IconButton>
        <IconButton onClick={handleGoBack} sx={{ color: 'white' }}>
          <ArrowBack />
        </IconButton>
        <IconButton
          onClick={handleGoForward}
          sx={{ color: 'white', marginRight: 5 }}
        >
          <ArrowForward />
        </IconButton>
        {/*}
        <Typography variant="h6">Video App</Typography>
        */}
      </Box>

      {/* 右側: 設定メニューボタン */}
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={toggleTheme} color="inherit">
          {theme === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <IconButton component={Link} to="/settings" sx={{ color: 'white' }}>
          <Settings />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header;
