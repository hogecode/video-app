import React from 'react';

import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { Box, Card, CardContent, IconButton, Typography } from '@mui/material';

import { Video } from '../types'; // Videoの型をインポート

interface VideoMetaDataProps {
  selectedVideo: Video | null; // selectedVideoをpropsで受け取る
}

const VideoMetaData: React.FC<VideoMetaDataProps> = ({ selectedVideo }) => {
  if (!selectedVideo) {
    return <Typography variant="h6">動画が選択されていません</Typography>;
  }

  const { fileName, views, liked, commentCount, commentedDate } = selectedVideo;

  return (
    <Box sx={{ maxWidth: 600, padding: 0.5 }}>
      <Card>
        <CardContent>
          {/* ファイル名 */}
          <Typography variant="body1" gutterBottom>
            {fileName.replace(/\.mp4$/, '')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* 再生回数 */}
            <Typography variant="body2" color="textSecondary">
              {views || 0} 回視聴
            </Typography>

            {/* コメント数 */}
            <Typography variant="body2" color="textSecondary">
              {commentCount ? commentCount : 0} コメ
            </Typography>

            {/* コメント時刻 */}
            <Typography variant="body2" color="textSecondary">
              {' '}
              {commentedDate
                ? new Intl.DateTimeFormat('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false, // 24時間制
                  }).format(new Date(commentedDate))
                : '無し'}
            </Typography>

　　　　　　　
            {/* いいね */}
            {/*
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {liked ? (
                <IconButton sx={{ padding: 0 }}>
                  <Favorite color="primary" />
                </IconButton>
              ) : (
                <IconButton sx={{ padding: 0 }}>
                  <FavoriteBorder color="disabled" />
                </IconButton>
              )}
            </Typography>
            */}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VideoMetaData;
