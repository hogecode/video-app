
import React from 'react';
import { Box} from '@mui/material';
import Sidebar from '../components/SideBar';
import Header from '../components/Header';
import ScrollToTopButton from 'components/ScrollToTopButton';

interface TemplatePageProps {
  children: React.ReactNode; // childrenを受け取る
}

const TemplatePage: React.FC<TemplatePageProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <ScrollToTopButton /> {/* スクロールトップボタン */}
      {/* サイドバー */}
      <Sidebar />

      {/* メインコンテンツエリア */}
      <Box sx={{ flexGrow: 1 }}>
        <Header /> {/* ヘッダー */}
        
        <Box sx={{ padding: 2 }}>
          {/* コンテンツとして渡されたchildren */}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default TemplatePage;
