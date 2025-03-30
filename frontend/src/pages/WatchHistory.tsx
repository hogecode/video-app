import { useVideoContext } from 'context/VideoContext';
import useScrollSpeed from 'hooks/useScrollSpeed';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'types';

import { SCROLL_SPEED } from '../constants';
import TemplatePage from './TemplatePage';
import UseFetch from 'hooks/UseFetch';
import { Button, Card, CardContent, Grid, Typography } from '@mui/material';

const WatchHistory: React.FC = () => {
  const { setSelectedVideo } = useVideoContext();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態

  const navigate = useNavigate();
  useScrollSpeed(SCROLL_SPEED); // スクロール速度の設定

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const result = await UseFetch<any>('/api/history');
      setData(result);
      setLoading(false);
    };

    fetchData();
  }, []); //

  const handleVideoClick = (video: Video) => {
    // クリックした動画を selectedVideo にセット
    setSelectedVideo(video);

    // 遷移先のパスに動画のIDを渡して遷移
    navigate(`/videos/${video.id}`);
  };

  if (!data) {
    return <Typography>再生履歴が存在しません。</Typography>;
  }

  return (
    <TemplatePage>
      <Grid container spacing={2}>
        {data.length > 0 ? (
          data.map((history) => (
            <Grid item xs={12} key={history.id}>
              <Card onClick={() => handleVideoClick(history?.video)}>
                <CardContent>
                  <Typography variant="h6">{history.video.fileName}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(history.watchedAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    Views: {history.video.views}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography>再生履歴がありません。</Typography>
        )}
      </Grid>
    </TemplatePage>
  );
};

export default WatchHistory;
