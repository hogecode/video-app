import React, { useEffect, useRef, useState } from 'react';

import { ArrowBack, ArrowDownward, ArrowForward, ArrowUpward, Refresh } from '@mui/icons-material';
import { Box, Button, IconButton, Typography } from '@mui/material';

import { Comment } from '../types';

interface CommentDelayControlProps {
  currentTime: number; // 現在の動画再生時間（秒）
  comments: Comment[]; // コメントデータ
  commentDelay: number; // コメント遅延時間
  handleCommentDelay: (newDelay: number) => void; // commentDelayの更新関数
}

const CommentDelayControl: React.FC<CommentDelayControlProps> = ({
  currentTime,
  comments,
  commentDelay,
  handleCommentDelay,
}) => {
  const [isIncreasing, setIsIncreasing] = useState(false);
  const [isDecreasing, setIsDecreasing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null); // インターバルIDを保持

  // 時間を分:秒形式で表示する関数
  const formatTime = (seconds: number): string => {
    const isNegative = seconds < 0; // secondsが負かどうかをチェック
    const absSeconds = Math.abs(seconds); // 秒数の絶対値を取る

    const minutes = Math.floor(absSeconds / 60);
    const remainingSeconds = Math.floor(absSeconds % 60);

    return `${isNegative ? '-' : ''}${minutes < 10 ? '0' : ''}${minutes}:${
      remainingSeconds < 10 ? '0' : ''
    }${remainingSeconds}`;
  };

  // コメント遅延時間を下げる
  const handleDecreaseDelay = () => {
    const newDelay = commentDelay - 1;
    handleCommentDelay(newDelay);
  };

  // コメント遅延時間を上げる
  const handleIncreaseDelay = () => {
    const newDelay = commentDelay + 1;
    handleCommentDelay(newDelay);
  };

  // 増加の長押し処理
  const startIncreasing = () => {
    setIsIncreasing(true);
  };

  // 減少の長押し処理
  const startDecreasing = () => {
    setIsDecreasing(true);
  };

  // ボタンが離された時の処理
  const stopChanging = () => {
    setIsIncreasing(false);
    setIsDecreasing(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // インターバル停止
    }
  };

  // 増減処理のタイマー
  useEffect(() => {
    if (isIncreasing) {
      intervalRef.current = setInterval(() => {
        handleIncreaseDelay(); // 増加
      }, 200); // 200msごとに増加
    } else if (isDecreasing) {
      intervalRef.current = setInterval(() => {
        handleDecreaseDelay(); // 減少
      }, 200); // 200msごとに減少
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // クリーンアップ
      }
    };
  }, [isIncreasing, isDecreasing]);

  // コメントデータに基づいて遅延時間を設定する
  const handleSetDelayFromComment = (text: string) => {
    // 現在の再生時間以降で、"A"というメッセージが現れるコメントを探す
    const commentAfterCurrentTime = comments.find(
      (comment) =>
        comment.message === text &&
        comment.vpos / 100 >= currentTime + commentDelay
    );

    if (commentAfterCurrentTime) {
      // 見つかった場合、vpos（1秒100vpos）を秒単位に変換
      const delayInSeconds = commentAfterCurrentTime.vpos / 100 - currentTime;
      handleCommentDelay(delayInSeconds);
    }
  };

  // リセットボタン
  const handleReset = () => {
    handleCommentDelay(0);
  };

  // イベント伝播を止める関数
  const handleBoxClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // イベントの伝播を止める
    event.preventDefault(); // デフォルトの動作を防ぐ
  };

  return (
    <Box
      sx={{ padding: '20px', textAlign: 'center' }}
      onDoubleClick={handleBoxClick}
    >
      <Typography variant="h6">
        コメント遅延: {formatTime(commentDelay)}
      </Typography>

      <IconButton
        onClick={() =>handleCommentDelay(commentDelay - 60)} // コメント遅延時間を60秒減らす
        sx={{
          margin: '10px',
          padding: '10px',
          fontSize: '20px',
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* コメント遅延時間を上げるボタン */}
      <IconButton
        onClick={() => handleCommentDelay(commentDelay - 5)} // コメント遅延時間を減らす
        // onMouseDown={startDecreasing}   // 長押し開始
        // onMouseUp={stopChanging}       // 長押し停止
        // onMouseLeave={stopChanging}    // ボタンからマウスが離れた場合の停止

        sx={{ margin: '10px', padding: '10px', fontSize: '20px' }}
      >
        <ArrowDownward />
      </IconButton>
      {/* コメント遅延時間を下げるボタン */}
      <IconButton
        onClick={() => handleCommentDelay(commentDelay + 5)} //
        // onMouseDown={startIncreasing} // 増加開始
        // onMouseUp={stopChanging} // 長押し終了
        // onMouseLeave={stopChanging} // ボタンからマウスが離れたら停止
        sx={{ margin: '10px', padding: '10px', fontSize: '20px' }}
      >
        <ArrowUpward />
      </IconButton>

      <IconButton
        onClick={() =>handleCommentDelay(commentDelay + 60)} // コメント遅延時間を60秒減らす
        sx={{
          margin: '10px',
          padding: '10px',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        <ArrowForward />
      </IconButton>

      {/* コメントデータに基づいて遅延時間を設定するボタン */}
      <Button
        variant="outlined"
        onClick={() => handleSetDelayFromComment('A')}
        sx={{ margin: '10px', padding: '10px', fontSize: '16px' }}
      >
        A
      </Button>

      <Button
        variant="outlined"
        onClick={() => handleSetDelayFromComment('B')}
        sx={{ margin: '10px', padding: '10px', fontSize: '16px' }}
      >
        B
      </Button>

      {/* リセットボタン */}
      <IconButton
        onClick={handleReset}
        sx={{ margin: '10px', padding: '10px', fontSize: '20px' }}
      >
        <Refresh />
      </IconButton>
    </Box>
  );
};

export default CommentDelayControl;
