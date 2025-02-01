// リフレッシュ後に動画を自動再生はできないらしい

import { useVideoContext } from 'context/VideoContext';
import Hls from 'hls.js';
import Plyr from 'plyr';
import React, { useEffect, useRef } from 'react';
import useDoubleTapSeek from './useDoubleTapSeek';
import { useNavigate } from 'react-router-dom';

interface VideoPlayerProps {
  source: string; // sourceをプロップスとして受け取る
  onTimeUpdate: (time: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ source, onTimeUpdate }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null); // Hlsインスタンスを保持するためのref
  const { selectedVideo, setSelectedVideo, filteredVideos } = useVideoContext();
  const navigate = useNavigate();

  useDoubleTapSeek(videoRef);

  useEffect(() => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls; // Hlsインスタンスをrefに保持
      hls.loadSource(source);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Plyrの初期化
        const player = new Plyr(videoRef.current, {
          /*
          controls: [
            'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip','fullscreen',  'stop'
          ],
          
          loop: { active: true }, // ループ再生
          */
          // autoplay: true, // 自動再生
          muted: false, // 初期状態でミュートしない
          keyboard: { focused: true, global: true }, // キーボード操作を有効にする
        });
      });

      hls.attachMedia(videoRef.current);
    } else {
      // Hls.jsがサポートされていない場合は、デフォルトオプションでPlyrを初期化
      const player = new Plyr(videoRef.current, {
        /*
        controls: [
          'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip','fullscreen',  'stop'
        ],
        loop: { active: true }, // ループ再生
        autoplay: true,     // 自動再生
        */
        muted: false, // 初期状態でミュートしない
        keyboard: { focused: true, global: true }, // キーボード操作を有効にする
      });
    }

    // クリーンアップ
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [source]); // sourceが変わるたびに再初期化されるように依存配列に追加

  useEffect(() => {
    const storedTime = localStorage.getItem(`videoTime_${source}`);
    if (videoRef.current) {
      videoRef.current.currentTime = storedTime ? parseFloat(storedTime) : 0;
    }
  }, [source]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime); // 再生時間が変わった時に親コンポーネントに通知
    }
  };

  useEffect(() => {
    const storedTime = localStorage.getItem(`videoTime_${source}`);
    if (videoRef.current) {
      videoRef.current.currentTime = storedTime ? parseFloat(storedTime) : 0;
    }
    return () => {
      if (videoRef.current) {
        localStorage.setItem(
          `videoTime_${source}`,
          videoRef.current.currentTime.toString()
        );
      }
    };
  }, []);

  // 動画終了時に次の動画を設定
  const handleVideoEnd = () => {
    if (!selectedVideo) return;

    // filteredVideo から現在の selectedVideo の次の動画を探す
    const currentIndex = filteredVideos.findIndex(
      (video) => video.id === selectedVideo.id
    );

    // 次の動画があるかどうかをチェック
    const nextVideo = filteredVideos[currentIndex + 1];

    if (nextVideo) {
      setSelectedVideo(nextVideo); // 次の動画を選択
      // 次の動画へリダイレクト
      navigate(`/videos/${nextVideo.id}`);
    } else {
      setSelectedVideo(filteredVideos[0]); // 最後の動画だった場合は最初の動画を選択
      navigate('/videos/' + filteredVideos[0].id);
    }
  };

  return (
    <div>
      <video
        ref={videoRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        autoPlay
        // 挙動がおかしくなるのでコメントアウト
        //poster={SCREENSHOT_URL +'/' +selectedVideo.fileName.replace(/\.mp4$/, '.png')}
      >
        <source src={source} type="application/x-mpegURL" />
      </video>
    </div>
  );
};

export default VideoPlayer;
