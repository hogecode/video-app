
import React from 'react';

import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

import { Video } from '../types';

interface VideoListProps {
  filteredVideos: Video[];
  handleVideoClick: (video: Video) => void;
}

const CenteredVideoListWithoutImage: React.FC<VideoListProps> = ({ filteredVideos, handleVideoClick }) => {
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
            width: '80%', // 一列で表示、横幅を調整
            maxWidth: '400px', // 最大幅を指定
            marginBottom: '20px', // アイテム間のスペース
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <CardContent>
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

export default CenteredVideoListWithoutImage;
