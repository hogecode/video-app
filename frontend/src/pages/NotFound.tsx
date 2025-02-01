
import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TemplatePage from './TemplatePage';

const NotFound: React.FC = () => {
  const navigate = useNavigate();  // 画面遷移のために useNavigate を使用

  const handleGoHome = () => {
    navigate('/');  // ホーム画面に遷移
  };

  return (
    <TemplatePage>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // 垂直方向に中央
        alignItems: 'center', // 水平方向に中央
        height: '100vh', // ビューポートの高さ全体
        textAlign: 'center', // テキストを中央寄せ
      }}
    >
      <Typography variant="h3" color="error">
        404 Not Found
      </Typography>
      <Typography variant="h6" color="textSecondary" sx={{ marginBottom: 2 }}>
        指定されたページは存在しません。
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleGoHome}
        sx={{ marginTop: 2 }}
      >
        ホームに戻る
      </Button>
    </Box>
    </TemplatePage>
  );
};

export default NotFound;