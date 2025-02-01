
import React, { useEffect } from 'react';

const useDoubleTapSeek = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  useEffect(() => {
    // タップ回数を管理
    let tapCount = 0;
    let tapTimeout: NodeJS.Timeout;

    const handleTouchStart = (event: TouchEvent) => {
      // タッチ位置が画面のどの部分かをチェック
      const screenWidth = window.innerWidth;
      const tapPositionX = event.touches[0].clientX;

      // ダブルタップ処理
      tapCount++;
      if (tapCount === 1) {
        tapTimeout = setTimeout(() => {
          tapCount = 0; // タイムアウト後にタップ回数をリセット
        }, 300); // ダブルタップとみなすタイムラグを300msに設定
      }

      if (tapCount === 2) {
        if (videoRef.current) {
          // 左側のダブルタップで-10秒、右側で+10秒、中央で再生/停止
          const currentTime = videoRef.current.currentTime;
          
          if (tapPositionX < screenWidth / 3) {
            // 左側の領域でダブルタップ => 10秒戻す
            videoRef.current.currentTime = currentTime - 10;
          } else if (tapPositionX > screenWidth * 2 / 3) {
            // 右側の領域でダブルタップ => 10秒進める
            videoRef.current.currentTime = currentTime + 10;
          } else {
            // 中央の領域でダブルタップ => 再生と停止をトグル
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
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
