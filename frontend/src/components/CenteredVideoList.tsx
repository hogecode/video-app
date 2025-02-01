
import React from 'react';
import { Card, CardContent, Typography, Box, Button, ImageList, ImageListItem } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Video } from '../types';
import { SCREENSHOT_URL } from '../constants';


interface VideoListProps {
  filteredVideos: Video[];
  handleVideoClick: (video: Video) => void;
}

const CenteredVideoList: React.FC<VideoListProps> = ({ filteredVideos, handleVideoClick }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      {filteredVideos.map((video) => (
        <Card
          key={video.id}
          onClick={() => handleVideoClick(video)}
          sx={{
            cursor: 'pointer',
            borderRadius: '16px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            width: '90%', // 一列で表示、横幅を調整
            // maxWidth: '600px', // 最大幅を指定
            marginBottom: '20px', // アイテム間のスペース
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <CardContent>
            <ImageList sx={{ width: '100%', height: 'auto', marginTop: '8px' }} cols={1}>
              <ImageListItem>
                <img
                  src={
                    video.screenshotFilePath
                      ? SCREENSHOT_URL + '/' + video.fileName.replace(/\.mp4$/, '.png')
                      : '/assets/fallback-image.svg'
                  }
                  alt="Screenshot"
                  loading="lazy"
                  crossOrigin="anonymous"
                  style={{
                    width: '100%', // 画像の幅を100%に設定
                    height: 'auto',
                    maxHeight: '180px', // 画像サイズを小さくする
                    objectFit: 'cover', // 画像がトリミングされないように
                  }}
                />
              </ImageListItem>
            </ImageList>
            <Typography variant="body1" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
              {video.fileName}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
              <Box sx={{ display: 'flex' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                  {video.views + '回視聴'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                  {(video.commentCount || 0) + 'コメ'}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                  {video.commentedDate
                    ? new Date(video.commentedDate).toLocaleDateString()
                    : '無し'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', mt: 1 }}>
                <Button
                  size="small"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVideoClick(video);
                  }}
                  sx={{ mr: 0.5 }}
                >
                  Watch Video
                </Button>

                {video.liked !== undefined && (
                  <Typography variant="body2" color="textSecondary">
                    {video.liked ? (
                      <Favorite color="primary" />
                    ) : (
                      <FavoriteBorder color="disabled" />
                    )}
                  </Typography>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default CenteredVideoList;
