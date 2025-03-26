import CenteredVideoList from 'components/CenteredVideoList';
import CenteredVideoListWithoutImage from 'components/CenteredVideoListWithoutImage';
import FilterChips from 'components/FilterChips';
import GridVideoList from 'components/GridVideoList';
import { useVideoContext } from 'context/VideoContext';
import useScrollSpeed from 'hooks/useScrollSpeed';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';
import { Video } from 'types';

import {
    ArrowDownward, ArrowUpward, CalendarToday, FileCopy, GridView, List, PlayArrow, Shuffle,
    ViewModule
} from '@mui/icons-material';
import { Box, Button, Chip, CircularProgress, Grid, IconButton, Typography } from '@mui/material';

import { SCROLL_SPEED } from '../constants';
import TemplatePage from './TemplatePage';
import UseFetch from 'hooks/UseFetch';
import { useHlsMode } from 'context/HlsModeContext';

const VideoList: React.FC = () => {
  const { setHlsMode } = useHlsMode(); // HLSモード設定を最初に

  const {
    videos,
    filteredVideos,
    fetchVideos,
    setSelectedVideo,
    sortVideos,
    filterVideosByYear,
    selectedYear,
  } = useVideoContext(); // Video関連の情報をまとめて取得
  
  const [loading, setLoading] = useState<boolean>(true); // ローディング状態
  const [viewType, setViewType] = useLocalStorage<
    'grid' | 'centered-image' | 'centered-no-image'
  >('viewType', 'grid'); // ビュータイプをローカルストレージに保存
  
  const [sortOrder, setSortOrder] = useState<{
    activeKey: 'fileName' | 'commentedDate'; // 現在アクティブなソート基準
    fileName: 'asc' | 'desc'; // fileName の並べ替え順
    commentedDate: 'asc' | 'desc'; // commentedDate の並べ替え順
  }>({
    activeKey: 'fileName', // 初期状態では fileName がアクティブ
    fileName: 'asc',
    commentedDate: 'asc',
  }); // ソート順の管理
  
  const navigate = useNavigate();
  useScrollSpeed(SCROLL_SPEED); // スクロール速度の設定
  

  // fetchVideos を呼び出して動画を取得
  const loadVideos = useCallback(async () => {
    setLoading(true);
    await fetchVideos(); 
    setLoading(false);
  }, [fetchVideos]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);


  // /api/config から設定情報を取得してコンテキストに設定
  useEffect(() => {
    const fetchHlsMode = async () => {
      try {
        const response = await UseFetch<any>('/api/config');

        if (response && response.isHlsModeEnabled !== undefined) {
          setHlsMode(response.isHlsModeEnabled);
        }
      } catch (error) {
        console.error('Error fetching HLS mode:', error);
      }
    };

    fetchHlsMode();
  }, []);

  const handleVideoClick = (video: Video) => {
    // クリックした動画を selectedVideo にセット
    setSelectedVideo(video);

    // 遷移先のパスに動画のIDを渡して遷移
    navigate(`/videos/${video.id}`);
  };

  const handleVideoStartClick = () => {
    // クリックした動画を selectedVideo にセット
    setSelectedVideo(filteredVideos[0]);

    // 遷移先のパスに動画のIDを渡して遷移
    navigate(`/videos/${filteredVideos[0].id}`);
  };

  const handleVideoShuffleClick = () => {
    // filteredVideos の中からランダムに1つの動画を選ぶ
    const randomIndex = Math.floor(Math.random() * filteredVideos.length);
    const randomVideo = filteredVideos[randomIndex];

    // クリックした動画を selectedVideo にセット
    setSelectedVideo(randomVideo);

    // 遷移先のパスに動画のIDを渡して遷移
    navigate(`/videos/${randomVideo.id}`);
  };


  // 取得した動画から動画が生成された年のセットを取得
  const uniqueYears = Array.from(
    new Set(
      videos
        .map((video) => {
          const commentedDate = new Date(video.commentedDate);
          // commentedDateが有効な日付かどうかを確認し、有効な場合にのみ年を取得
          return !isNaN(commentedDate.getTime())
            ? commentedDate.getFullYear()
            : null;
        })
        .filter((year) => year !== null) // null を除外
    )
  ).sort((a, b) => a - b);


  // 異なるソート順で動画を並び替える関数
  const handleSort = (key: 'fileName' | 'commentedDate') => {
    const newOrder = sortOrder[key] === 'asc' ? 'desc' : 'asc'; // 並べ替え順を反転
    setSortOrder((prev) => ({
      ...prev,
      [key]: newOrder, // 指定されたキーの並べ替え順を変更
      activeKey: key, // アクティブなソート基準を更新
    }));
    sortVideos(key, newOrder); // sortVideos を使って並べ替えを実行
  };

  return (
    <TemplatePage>
      <Grid container spacing={2}>
        {/* Box内の内容は他の要素と横並びにしない */}
        <Box sx={{ width: '100%', marginTop: '20px', marginLeft: '20px' }}>
          {/* 年別フィルター */}
          <FilterChips
            years={uniqueYears}
            selectedYear={selectedYear}
            onYearSelect={filterVideosByYear}
          />

          {/* ツールバーの2段目を横並びにするためのBox */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <Box display="flex" alignItems="center">
              {/* ファイル名の並べ替え */}
              <IconButton
                onClick={() => handleSort('fileName')}
                title={`Sort by File Name ${
                  sortOrder.fileName === 'asc' ? 'Asc' : 'Desc'
                }`}
                color={
                  sortOrder.activeKey === 'fileName' ? 'primary' : 'default'
                } // アクティブな基準に応じて色を変更
              >
                <FileCopy />
                {sortOrder.fileName === 'asc' ? (
                  <ArrowUpward fontSize="small" />
                ) : (
                  <ArrowDownward fontSize="small" />
                )}
              </IconButton>

              {/* コメント日付の並べ替え */}
              <IconButton
                onClick={() => handleSort('commentedDate')}
                title={`Sort by Commented Date ${
                  sortOrder.commentedDate === 'asc' ? 'Asc' : 'Desc'
                }`}
                color={
                  sortOrder.activeKey === 'commentedDate'
                    ? 'primary'
                    : 'default'
                } // アクティブな基準に応じて色を変更
              >
                <CalendarToday />
                {sortOrder.commentedDate === 'asc' ? (
                  <ArrowUpward fontSize="small" />
                ) : (
                  <ArrowDownward fontSize="small" />
                )}
              </IconButton>
            </Box>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
              }}
            >
              {/* 再生アイコン */}
              <IconButton
                // color="default"
                onClick={handleVideoStartClick}
                disabled={filteredVideos.length === 0}
                sx={{ fontSize: 40 }}
              >
                <PlayArrow />
              </IconButton>

              {/* シャッフルアイコン */}
              <IconButton
                // color="default"
                onClick={handleVideoShuffleClick}
                disabled={filteredVideos.length === 0}
                sx={{ fontSize: 40 }}
              >
                <Shuffle />
              </IconButton>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* 表示切替用のチップ */}
              <Box>
                <Chip
                  icon={<GridView />}
                  clickable
                  color={viewType === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewType('grid')}
                  sx={{ marginRight: 0.5 }}
                />
                <Chip
                  icon={<ViewModule />}
                  clickable
                  color={viewType === 'centered-image' ? 'primary' : 'default'}
                  onClick={() => setViewType('centered-image')}
                  sx={{ marginRight: 0.5 }}
                />
                <Chip
                  icon={<List />}
                  clickable
                  color={
                    viewType === 'centered-no-image' ? 'primary' : 'default'
                  }
                  onClick={() => setViewType('centered-no-image')}
                />
              </Box>
            </Box>
          </Box>
        </Box>

        {loading ? (
          // ローディング中にスピナーを表示
          <Grid
            item
            xs={12}
            alignItems="center"
            justifyContent="center"
            container
          >
            <CircularProgress />
          </Grid>
        ) : videos.length > 0 ? (
          filteredVideos.length > 0 ? (
            viewType === 'grid' ? (
              <GridVideoList
                filteredVideos={filteredVideos}
                handleVideoClick={handleVideoClick}
              />
            ) : viewType === 'centered-image' ? (
              <CenteredVideoList
                filteredVideos={filteredVideos}
                handleVideoClick={handleVideoClick}
              />
            ) : (
              <CenteredVideoListWithoutImage
                filteredVideos={filteredVideos}
                handleVideoClick={handleVideoClick}
              />
            )
          ) : null
        ) : (
          // 動画がない場合
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            sx={{ width: '100%' }}
          >
            No videos available.
          </Typography>
        )}
      </Grid>
    </TemplatePage>
  );
};

export default VideoList;
