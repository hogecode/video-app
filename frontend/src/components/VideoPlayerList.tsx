import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import { useVideoContext } from 'context/VideoContext';
import { SCREENSHOT_URL } from '../constants';
import { Video } from 'types';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, ArrowForward, ExpandMore } from '@mui/icons-material';

const VideoPlayerList: React.FC = () => {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { videos, selectedVideo, setSelectedVideo, filteredVideos } =
    useVideoContext();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true); // アコーディオンの開閉状態

  const handleAccordionChange = () => {
    setExpanded((prev) => !prev);
  };

  // 動画が選択されている場合、その動画の位置までスクロール
  useEffect(() => {
    if (selectedVideo && videoContainerRef.current) {
      const selectedIndex = filteredVideos.findIndex(
        (video) => video.id === selectedVideo.id
      );
      const selectedVideoElement = videoRefs.current[selectedIndex];

      if (selectedVideoElement && videoContainerRef.current) {
        // 親コンテナ内でスクロールを制限してスクロール
        // ページ全体に適用させない
        videoContainerRef.current.scrollTo({
          top: selectedVideoElement.offsetTop, // 親コンテナ内でスクロール位置を設定
          behavior: 'smooth', // スムーズにスクロール
        });
      }
    }
  }, [selectedVideo, videos]);

  // カードクリック時に実行される処理
  const handleCardClick = (video: Video) => {
    setSelectedVideo(video); // selectedVideoを更新
    navigate(`/videos/${video.id}`); // URLの`/videos/:id`を更新
  };

  // 前の動画を選択する関数
  const handlePreviousVideo = () => {
    if (!selectedVideo || !filteredVideos) return;

    const currentIndex = filteredVideos.findIndex(
      (video) => video.id === selectedVideo.id
    );

    const previousVideo =
      filteredVideos[currentIndex - 1] ||
      filteredVideos[filteredVideos.length - 1]; // 前の動画、なければ最後に戻る

    setSelectedVideo(previousVideo); // 前の動画を選択
    navigate(`/videos/${previousVideo.id}`); // 前の動画にリダイレクト
  };

  // 次の動画を選択する関数
  const handleNextVideo = () => {
    if (!selectedVideo || !filteredVideos) return;

    const currentIndex = filteredVideos.findIndex(
      (video) => video.id === selectedVideo.id
    );

    const nextVideo = filteredVideos[currentIndex + 1] || filteredVideos[0]; // 次の動画、なければ最初に戻る

    setSelectedVideo(nextVideo); // 次の動画を選択
    navigate(`/videos/${nextVideo.id}`); // 次の動画にリダイレクト
  };

  return (
    <Box
      ref={videoContainerRef}
      sx={{
        marginTop: '15px',
        maxHeight: '600px',
        overflowY: 'auto',
        border: '2px black solid',
        position: 'relative', // アコーディオンを右上に配置するための相対位置
      }}
    >
      {/* アコーディオン */}
      <Accordion
        expanded={expanded}
        onChange={handleAccordionChange}
        sx={{ boxShadow: 'none' }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          aria-controls="panel-content"
          id="panel-header"
          sx={{
            height: '56px', // 高さを指定
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center', // 垂直方向に中央揃え
          }}
        >
          <Box
            sx={{ marginRight: '50px', display: 'flex', alignItems: 'center' }}
          >
            <Typography　variant='body1'>Videos</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* 前の動画ボタン、アイコン変えたい */}
            <IconButton onClick={handlePreviousVideo} size='small' sx={{ fontSize: '12px' }}>
              <ArrowBack />
            </IconButton>

            {/* 次の動画ボタン */}
            <IconButton onClick={handleNextVideo} size='small' sx={{ fontSize: '12px' }}>
              <ArrowForward />
            </IconButton>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <Box>
            {filteredVideos.map((video, index) => (
              <div
                key={video.id}
                ref={(el) => (videoRefs.current[index] = el)}
                style={{
                  marginBottom: '8px',
                  cursor: 'pointer',
                  borderColor:
                    video.id === selectedVideo.id ? 'blue' : 'transparent',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                }}
                onClick={() => handleCardClick(video)}
              >
                <Card
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    height: '50px',
                    alignItems: 'center',
                  }}
                >
                  {video.screenshotFilePath && (
                    <img
                      src={
                        SCREENSHOT_URL +
                        '/' +
                        video.fileName.replace(/\.mp4$/, '.png')
                      }
                      alt={video.fileName}
                      style={{
                        height: '50px', // 画像の高さを50pxに設定
                        objectFit: 'contain', // 画像が切れずに収まるように調整
                        marginRight: '8px', // 画像とテキストの間にスペースを追加
                      }}
                    />
                  )}
                  <CardContent sx={{ padding: '4px', height: '50px' }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {video.fileName}
                    </Typography>
                  </CardContent>
                </Card>
              </div>
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default VideoPlayerList;
