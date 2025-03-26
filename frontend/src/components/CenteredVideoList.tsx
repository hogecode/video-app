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

interface VideoListProps {
  filteredVideos: Video[];
  handleVideoClick: (video: Video) => void;
}

const CenteredVideoList: React.FC<VideoListProps> = ({
  filteredVideos,
  handleVideoClick,
}) => {
  const { theme, toggleTheme } = useTheme();

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
                      {(video.commentCount || 0) + 'コメ'}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mr: 1 }}
                    >
                      {video.commentedDate
                        ? new Date(video.commentedDate).toLocaleString(
                            'ja-JP',
                            {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false, // 24時間形式にする場合
                            }
                          )
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

export default CenteredVideoList;
