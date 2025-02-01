
import { useEffect } from 'react';

const useScrollSpeed = (speed = 1) => {
  useEffect(() => {
    // スクロールイベントをリッスン
    const handleScroll = (e) => {
      // スクロールの速度を調整
      if (e.deltaY !== 0) {
        window.scrollBy({
          top: e.deltaY * speed,  // スクロール量を速度で調整
          behavior: 'smooth',  // スムーススクロール
        });
      }
    };

    // スクロールイベントの追加
    window.addEventListener('wheel', handleScroll, { passive: true });

    // クリーンアップ
    return () => {
      window.removeEventListener('wheel', handleScroll);
    };
  }, [speed]);
};

export default useScrollSpeed;
