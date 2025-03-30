import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { Delete, Favorite, FavoriteBorder } from '@mui/icons-material';
import { Video } from '../types'; // Video 型をインポート
import { SCREENSHOT_URL } from '../constants';
import { useTheme } from 'context/ThemeContext';
import { useIntersectionObserver } from 'usehooks-ts';
import UseFetch from 'hooks/UseFetch';

interface VideoListProps {
  filteredVideos: any[];
  handleVideoClick: (video: Video) => void;
}

const WatchHistoryList: React.FC<VideoListProps> = ({
  filteredVideos,
  handleVideoClick,
}) => {

  const [historyVideos, setHistoryVideos] = useState<any>(filteredVideos);

  // ...分前、時間前など再生履歴を相対時間に変更する関数
  const getRelativeTime = (watchedAt: Date): string => {
    const now = new Date();
    const watchedDate = new Date(watchedAt);
    const diffInSeconds = Math.floor(
      (now.getTime() - watchedDate.getTime()) / 1000
    );

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(diffInSeconds / 3600);
    const days = Math.floor(diffInSeconds / 86400);

    if (minutes < 1) {
      return 'たった今';
    } else if (minutes < 60) {
      return `${minutes}分前`;
    } else if (hours < 24) {
      return `${hours}時間前`;
    } else {
      return `${days}日前`;
    }
  };

  // 履歴削除関数
  const deleteHistoryById = async (id: string): Promise<void> => {
    try {
      const response = await UseFetch(`/api/history/${id}`, {
        method: 'DELETE', // DELETEリクエストを送信
      });
      // 削除後の更新処理（例えば、データを再取得するなど）
    } catch (error) {
      console.error(`動画 ID ${id} の削除中にエラーが発生しました`, error);
    }
  };

  // 削除クリック時のイベントハンドラ
  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation(); // クリックイベントのバブリングを防止
    deleteHistoryById(id); // 履歴削除処理を実行

    // 新しい配列を作成して状態を更新
    setHistoryVideos((prevVideos) => {
      const index = prevVideos.findIndex((item) => item.id === id);
      if (index !== -1) {
        const updatedVideos = [...prevVideos];
        updatedVideos.splice(index, 1); // 削除処理
        console.log(`id ${id} の要素が削除されました`);
        return updatedVideos; // 新しい配列で状態を更新
      } else {
        console.log(`id ${id} の要素は存在しません`);
        return prevVideos; // 変更しない
      }
    });
  };

  return (
    <>
      {historyVideos.map((video) => (
        <Grid
          container
          item
          key={video.id}
          justifyContent="center"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card
            onClick={() => handleVideoClick(video)}
            sx={{
              maxWidth: '600px',
              height: '160px',
              cursor: 'pointer',
              borderRadius: '16px',
              borderButtom: '10px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'scale(1.02)',
                boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center', // コンテンツを縦方向でセンタリング
                justifyContent: 'flex-start', // 左寄せ
              }}
            >
              <ImageList
                sx={{ maxWidth: '40%', height: 'auto', marginTop: '8px' }}
                cols={1}
              >
                <ImageListItem>
                  <img
                    src={
                      video.video.screenshotFilePath
                        ? SCREENSHOT_URL +
                          '/' +
                          video.video.fileName.replace(/\.mp4$/, '.png')
                        : '/assets/fallback-image.svg'
                    }
                    alt="Screenshot"
                    loading="lazy"
                    crossOrigin="anonymous"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </ImageListItem>
              </ImageList>
              <Box
                sx={{
                  marginLeft: '15px',
                }}
              >
                <Typography variant="body1">{video.video.fileName}</Typography>
                <Box sx={{ maxWidth: 600 }}>
                  <Box sx={{ display: 'flex' }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mr: 1 }}
                    >
                      {video.watchedAt
                        ? getRelativeTime(video.watchedAt) + '視聴'
                        : '無し'}
                    </Typography>
                    <Delete onClick={(e) => handleDeleteClick(e, video.id)} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </>
  );
};

export default WatchHistoryList;
