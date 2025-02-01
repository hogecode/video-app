
import React from 'react';
import { IconButton } from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';
import useScrollToTop from '../hooks/useScrollToTop';

const ScrollToTopButton = () => {
  // スクロール位置が500pxを超えるとボタンを表示
  const isVisible = useScrollToTop(500);

  // ボタンがクリックされたときにページトップへスクロール
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // スムーズにスクロール
    });
  };

  if (!isVisible) return null; // スクロール位置が500px未満の場合、ボタンは表示しない

  return (
    <IconButton
      onClick={scrollToTop}
      sx={{
        zIndex: 1000,
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#1976d2', // アイコンの背景色
        color: 'white',
        '&:hover': {
          backgroundColor: '#1565c0', // ホバー時の背景色
        },
      }}
    >
      <ArrowUpward />
    </IconButton>
  );
};

export default ScrollToTopButton;
