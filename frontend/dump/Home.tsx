//ToDo: fetchしてアイコンかリスト表示のみ切り替える

import React, { useCallback, useEffect, useState } from 'react';
import useVideoStore from '../../dump/stores/VideoStore';
import { Card, CardContent, Typography,  Button, Grid, CircularProgress } from '@mui/material';
import { Video } from 'types';
import UseFetch from 'hooks/UseFetch';

const VideoList: React.FC = () => {
  /*
  const { videos, fetchVideos: fetchVideosFromStore } = useVideoStore((state) => ({
    videos: state.videos,
    fetchVideos: state.fetchVideos,
  }));

  // ローディング状態の追加
  const [loading, setLoading] = useState<boolean>(true);

  // fetchVideos を useCallback でメモ化
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    await fetchVideosFromStore();
    setLoading(false);  // データ取得が完了したらローディングをオフ
  }, [fetchVideosFromStore]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
*/

const [videos, setVideos] = useState<Video[]>([]);
const [loading, setLoading] = useState<boolean>(true);

// videos を取得する関数を作成
const fetchVideos = useCallback(async () => {
  setLoading(true);
  try {
    const data = await UseFetch<Video[]>('/api/files'); // UseFetch を使ってデータ取得
    setVideos(data); // 取得したデータを videos にセット
  } catch (error) {
    console.error('Failed to fetch videos:', error);
  } finally {
    setLoading(false); // ローディングを終了
  }
}, []);

// コンポーネントがマウントされた時に videos を取得
useEffect(() => {
  fetchVideos();
}, [fetchVideos]);

  return (
    <Grid container spacing={2}>
      {loading ? (
        // ローディング中にスピナーを表示
        <Grid item xs={12} alignItems="center" justifyContent="center" container>
          <CircularProgress />
        </Grid>
      ) : videos.length > 0 ? (
        // 動画リストがある場合
        videos.map((video) => (
          <Grid item key={video.id} xs={12} sm={6} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6">{video.fileName}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Views: {video.views} | Comments: {video.commentCount}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Created At: {new Date(video.createdAt).toLocaleDateString()}
                </Typography>
                <Button size="small" color="primary" onClick={() => alert('Select Video')}>
                  Select
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))
      ) : (
        // 動画がない場合
        <Typography variant="body1" color="textSecondary" align="center" sx={{ width: '100%' }}>
          No videos available.
        </Typography>
      )}
    </Grid>
  );
};

export default VideoList;