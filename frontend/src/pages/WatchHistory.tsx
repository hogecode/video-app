import { useVideoContext } from 'context/VideoContext';
import useScrollSpeed from 'hooks/useScrollSpeed';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'types';

import { SCROLL_SPEED } from '../constants';
import TemplatePage from './TemplatePage';
import UseFetch from 'hooks/UseFetch';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material';
import GridVideoList from 'components/GridVideoList';
import CenteredVideoList from 'components/CenteredVideoList';
import WatchHistoryList from 'components/WatchHistoryList';
import { Delete } from '@mui/icons-material';

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

  const deleteAllHistory = async (): Promise<void> => {
    try {
      const response = await UseFetch<any>('/api/history', {
        method: 'DELETE', // DELETEリクエストを送信
      });
      setData(null);
    } catch (error) {
      console.error('履歴の削除中にエラーが発生しました', error);
    }
  };

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
        <>
          <Tooltip title="履歴を全て削除" arrow>
            <Delete onClick={deleteAllHistory} />
          </Tooltip>
          <WatchHistoryList
            filteredVideos={data}
            handleVideoClick={handleVideoClick}
          />
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <Typography>再生履歴がありません。</Typography>
        </Box>
      )}
    </TemplatePage>
  );
};

export default WatchHistory;
