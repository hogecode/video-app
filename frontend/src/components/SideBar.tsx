//Memo: label周りでレイアウトがおかしくなる

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
import { Menu, Home, Settings, History, Favorite } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// サイドバー用のコンポーネント
const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false); // サイドバーの開閉状態
  const [hover, setHover] = useState<boolean>(false); // ホバー時の状態

  const navigate = useNavigate(); // useNavigateフックで遷移処理を取得

  const handleItemClick = (link: string) => {
    navigate(link); // クリックされたアイテムに対応するリンクに遷移
  };

  // サイドバーのアイコンリスト
  const sidebarItems = [
    { icon: <Home />, label: 'ビデオ', description: '', link: '/' },
    {
      icon: <Favorite />,
      label: 'お気に入り',
      description: '',
      link: '/favorites',
    },
    { icon: <History />, label: '再生履歴', description: '', link: '/history' },
    { icon: <Settings />, label: '設定', description: '', link: '/settings' },
  ];

  return (
    <Drawer
      variant="permanent"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
          height: '100%',
          paddingTop: 2,
        }}
      >
        {/* ハンバーメニュー */}
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Menu />
        </IconButton>

        <List>
          {sidebarItems.map((item, index) => (
            <ListItem
              onClick={() => handleItemClick(item.link)}
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 2,
                borderBottom: hover?'1px solid #ddd':'none', // ホバー時にボーダーを表示
                '&:last-child': { borderBottom: 'none'},
                '&:hover': { backgroundColor: '#f0f0f0' }, // ホバー時のスタイル
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>

              {/* サイドバーアイテムのラベルと説明 */}
              <ListItemText
                primary={hover ? item.label : ''}
                secondary={hover ? item.description : ''}
                sx={{
                  fontSize: '0.7em', // 多分適用されていない
                  transition: 'opacity 0.3s',
                  opacity: hover ? 1 : 0, // ホバー時に説明を表示
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
