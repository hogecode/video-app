//ToDo: プレビュー、cssが表示されない
//ToDo: hls機能、コメント表示は後ででいい
//Refactor: componentsに後で分ける

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Plyr from 'plyr'; // Plyr のインポート
import 'plyr/dist/plyr.css'; // Plyr のスタイルもインポート
import  './Video.css';

const Video: React.FC = () => {
  const { video } = useParams(); // 動的ルートパラメータを取得
  const videoUrl= useState<string | null>(null); // 動画のURLを格納するstate
  const playerRef = useRef<HTMLVideoElement | null>(null); // Plyr のインスタンスを保持する ref

  useEffect(() => {
    // videoUrlが設定されたらPlyrインスタンスを初期化
    if (videoUrl && playerRef.current) {
      const player = new Plyr(playerRef.current, {
        controls: [
          'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip','fullscreen',  'stop'
        ],
        autoplay: true,     // 自動再生
        loop: { active: true }, // ループ再生
        muted: false,       // 初期状態でミュートしない
        keyboard: { focused: true, global: true }, // キーボード操作を有効にする
        settings: ['quality', 'speed', 'captions'],  // 画質、速度、キャプションの設定項目を表示
      });

      // コンポーネントがアンマウントされたときにPlyrを破棄
      return () => {
        player.destroy();
      };
    }
  }, [videoUrl]); // videoUrlが更新された際にPlyrを初期化


  if (!videoUrl) {
    return <div>動画を読み込み中...</div>; // 動画URLが取得できるまでのローディング表示
  }

  return (
    <div>
      <video ref={playerRef} controls>
        <source src={`http://localhost:3000/video/${video}.mp4`} type="video/mp4" />
        お使いのブラウザでは動画を再生できません。
      </video>
      <h1>{video}</h1>
    </div>
  );
}

export default Video;

