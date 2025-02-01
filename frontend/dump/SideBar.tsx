import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Menu, Home, Settings, Favorite, History } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';

// サイドバー用のコンポーネント
const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false); // サイドバーの開閉状態
  // const [hover, setHover] = useState<boolean>(false); // ホバー時の状態

  /*
  const navigate = useNavigate(); // useNavigateフックで遷移処理を取得

  
  const handleItemClick = (link: string) => {
    navigate(link); // クリックされたアイテムに対応するリンクに遷移
  };
*/
  // サイドバーのアイコンリスト
  const sidebarItems = [
    { icon: <Home />, label: 'ホームページ', link: '/' },
    { icon: <Favorite />, label: 'お気に入り', link: '/favorites' },
    { icon: <History />, label: '視聴履歴', link: '/history' },
    { icon: <Settings />, label: '設定', link: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      sx={{
        width: 60,
        flexShrink: 0,
        backgroundColor: '#1976d2',
        '& .MuiDrawer-paper': {
          width: 60,
          boxSizing: 'border-box',
          transition: 'width 0.1s ease',
        },
        '&:hover .MuiDrawer-paper': {
          width: 200, // ホバー時に幅を広げる
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexStart: 'flex-start',
          height: '100%',
          paddingTop: 2,
        }}
      >
        {/* ハンバーメニュー */}
        <IconButton onClick={() => setOpen(true)}>
          <Menu />
        </IconButton>

        <List>
          {sidebarItems.map((item, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 2,
                '&:hover': { backgroundColor: '#f0f0f0' }, // ホバー時のスタイル
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>

              {/* サイドバーアイテムのラベルと説明 */}
              <ListItemText
                primary={item.label}
                // secondary={open ? item.description : ''}
                sx={{
                  transition: 'opacity 0.3s',
                  opacity: open ? 1 : 0, // ホバー時に説明を表示
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

