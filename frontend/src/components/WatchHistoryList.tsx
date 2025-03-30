import React from 'react';
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
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Video } from '../types'; // Video 型をインポート
import { SCREENSHOT_URL } from '../constants';
import { useTheme } from 'context/ThemeContext';
import { useIntersectionObserver } from 'usehooks-ts';

interface VideoListProps {
  filteredVideos: Video[];
  handleVideoClick: (video: Video) => void;
}

const WatchHistoryList: React.FC<VideoListProps> = ({
  filteredVideos,
  handleVideoClick,
}) => {

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

  return (
    <>
      {filteredVideos.map((video) => (
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
                      video.screenshotFilePath
                        ? SCREENSHOT_URL +
                          '/' +
                          video.fileName.replace(/\.mp4$/, '.png')
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
                <Typography variant="body1">{video.fileName}</Typography>
                <Box sx={{ maxWidth: 600 }}>
                  <Box sx={{ display: 'flex' }}>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mr: 1 }}
                    >
                      {video.watchedAt
                        ? getRelativeTime(video.watchedAt) + 'に視聴'
                        : '無し'}
                    </Typography>
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
