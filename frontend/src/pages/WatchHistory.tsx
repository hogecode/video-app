import { useVideoContext } from 'context/VideoContext';
import useScrollSpeed from 'hooks/useScrollSpeed';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'types';

import { SCROLL_SPEED } from '../constants';
import TemplatePage from './TemplatePage';
import UseFetch from 'hooks/UseFetch';
import { Button, Card, CardContent, Grid, Typography } from '@mui/material';
import GridVideoList from 'components/GridVideoList';
import CenteredVideoList from 'components/CenteredVideoList';
import WatchHistoryList from 'components/WatchHistoryList';

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
      // フラットなデータ構造に変換
      const flatData = result.map((history: any) => ({
        ...history.watchedAt,
        ...history.video,
      }));

      setData(flatData);
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
      {data.length > 0 ? (
        <WatchHistoryList
          filteredVideos={data}
          handleVideoClick={handleVideoClick}
        />
      ) : (
        <Typography>再生履歴がありません。</Typography>
      )}
    </TemplatePage>
  );
  
};

export default WatchHistory;
