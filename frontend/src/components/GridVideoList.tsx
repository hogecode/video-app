
import React from 'react';

import { Favorite, FavoriteBorder } from '@mui/icons-material';
import {
    Box, Button, Card, CardContent, Grid, ImageList, ImageListItem, Typography
} from '@mui/material';

import { SCREENSHOT_URL } from '../constants';
import { Video } from '../types'; // Video 型をインポート

interface VideoListProps {
  filteredVideos: Video[];
  handleVideoClick: (video: Video) => void;
}

const GridVideoList: React.FC<VideoListProps> = ({ filteredVideos, handleVideoClick }) => {
  return (
    <>
      {filteredVideos.map((video) => (
        <Grid item key={video.id} xs={12} sm={6} md={4} lg={4}>
          <Card
            onClick={() => handleVideoClick(video)}
            sx={{
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
                    style={{ width: '100%', height: 'auto' }}
                  />
                </ImageListItem>
              </ImageList>
              <Typography variant="body1">{video.fileName}</Typography>
              <Box sx={{ maxWidth: 600 }}>
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

                {/* 追加情報が別行になるように */}
                <Box sx={{ display: 'flex' }}>
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

                  {/* liked が true の場合、ハートアイコンに色をつける */}
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
        </Grid>
      ))}
    </>
  );
};

export default GridVideoList;