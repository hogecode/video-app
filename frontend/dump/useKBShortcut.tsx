import { useEffect } from "react";

// キーボードショートカットを処理するフック
const useKeyboardShortcuts = (plyrRef: React.RefObject<HTMLVideoElement>) => {
  useEffect(() => {
    if (!plyrRef.current) return;

    // 既に `usePlyr` フックでインスタンスが生成されているので Plyr を再生成する必要はありません
    const videoElement = plyrRef.current;

    // キーボードイベントの処理
    const handleKeydown = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          // スペースキーで再生/一時停止
          if (videoElement.paused) {
            videoElement.play();
          } else {
            videoElement.pause();
          }
          break;
        case "ArrowUp":
          // 上矢印キーで音量アップ
          videoElement.volume = Math.min(videoElement.volume + 0.1, 1);
          break;
        case "ArrowDown":
          // 下矢印キーで音量ダウン
          videoElement.volume = Math.max(videoElement.volume - 0.1, 0);
          break;
        case "f":
          // Fキーでフルスクリーン
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            videoElement.requestFullscreen();
          }
          break;
        default:
          break;
      }
    };

    // キーボードイベントリスナーを追加
    window.addEventListener("keydown", handleKeydown);

    // クリーンアップ
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [plyrRef]);
};

export default useKeyboardShortcuts;