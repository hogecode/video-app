// リフレッシュ後に動画を自動再生はできないらしい

import { useVideoContext } from 'context/VideoContext';
import Hls from 'hls.js';
import Plyr from 'plyr';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import useDoubleTapSeek from './useDoubleTapSeek';
import { useHlsMode } from 'context/HlsModeContext';
import { useDebounce, useTimeoutFn } from 'react-use';
import { useEventListener, useTimeout } from 'usehooks-ts';

interface VideoPlayerProps {
  source: string; // sourceをプロップスとして受け取る
  onTimeUpdate: (time: number) => void;
}

const VideoPlayer = forwardRef((props: VideoPlayerProps, ref) => {
  const { source, onTimeUpdate } = props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null); // Hlsインスタンスを保持するためのref
  const [height, setHeight] = useState<number | null>(null);

  const { selectedVideo, setSelectedVideo, filteredVideos } = useVideoContext();
  const navigate = useNavigate();
  const { hlsMode } = useHlsMode();
  useDoubleTapSeek(videoRef);

  // useImperativeHandleを使用して親コンポーネントに高さを渡す
  useImperativeHandle(ref, () => ({
    getVideoHeight: () => {
      return videoRef.current ? videoRef.current.clientHeight : null;
    },
  }));

  // 動画の高さを更新
  const updateHeight = () => {
    if (videoRef.current) {
      setHeight(videoRef.current.clientHeight);
    }
  };

  useEventListener('resize', () => {
    updateHeight();
  });

  // 機能しない
  useTimeout(updateHeight, 200);
  useTimeout(updateHeight, 400);
  useTimeout(updateHeight, 800);

  // 初回マウント時に高さを設定
  useEffect(() => {
    updateHeight();
  }, []);

  // Plyrのオプション
  const plyrOptions = {
    muted: false, // 初期状態でミュートしない
    keyboard: { focused: true, global: true }, // キーボード操作を有効にする
    // 他のオプションを追加
    // controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    // loop: { active: true }, // ループ再生
  };

  // Hls.jsとPlyrのセットアップ
  // Memo: sourceを依存配列にする必要はあるのか
  useEffect(() => {
    console.log('hlsMode: ', hlsMode);

    if (!videoRef.current) return;

    // mp4モードの場合に早期リターン
    if (!hlsMode) {
      const player = new Plyr(videoRef.current, plyrOptions);
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls; // Hlsインスタンスをrefに保持
      hls.loadSource(source);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Plyrの初期化
        const player = new Plyr(videoRef.current, plyrOptions);
      });

      hls.attachMedia(videoRef.current);
    } else {
      // Hls.jsがサポートされていない場合
      const player = new Plyr(videoRef.current, plyrOptions);
    }

    // クリーンアップ
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [source]);

  // 再生時間が変わった時に親コンポーネントに通知する関数
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  // 動画終了時に次の動画を設定する関数
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
        <source
          src={source}
          type={hlsMode ? 'application/x-mpegURL' : 'video/mp4'}
        />
      </video>
    </div>
  );
});

export default VideoPlayer;
