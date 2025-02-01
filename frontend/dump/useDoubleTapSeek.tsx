/*
import React, { useEffect } from 'react';

const useDoubleTapSeek = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  useEffect(() => {
    // タップ回数を管理
    let tapCount = 0;
    let tapTimeout: NodeJS.Timeout;

    const handleTouchStart = (event: TouchEvent) => {
      // タッチ位置が画面の左側か右側かをチェック
      const screenWidth = window.innerWidth;
      const tapPosition = event.touches[0].clientX;
      const isLeft = tapPosition < screenWidth / 2;

      // ダブルタップ処理
      tapCount++;
      if (tapCount === 1) {
        tapTimeout = setTimeout(() => {
          tapCount = 0; // タイムアウト後にタップ回数をリセット
        }, 300); // ダブルタップとみなすタイムラグを300msに設定
      }

      if (tapCount === 2) {
        if (videoRef.current) {
          // 左側のダブルタップで-10秒、右側で+10秒
          const currentTime = videoRef.current.currentTime;
          videoRef.current.currentTime = isLeft ? currentTime - 10 : currentTime + 10;
        }
        tapCount = 0; // タップ回数をリセット
      }
    };

    // タッチイベントのリスナーを追加
    window.addEventListener('touchstart', handleTouchStart);

    // クリーンアップ
    return () => {
      clearTimeout(tapTimeout);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, [videoRef]);
};

export default useDoubleTapSeek;
*/