import React, { useEffect, useRef, useState } from 'react';
import { List } from 'react-virtualized';

import { Box, Button, Grid, Typography } from '@mui/material';

import { Comment } from '../types';
import { Close, OpenInFull } from '@mui/icons-material';


interface VideoCommentsProps {
  comments: Comment[];
  videoTime: number;
  commentDelay: number;
  handleCommentListOpen: () => void;
}

const VideoComments: React.FC<VideoCommentsProps> = ({
  comments,
  videoTime,
  commentDelay,
  handleCommentListOpen
}) => {
  const listRef = useRef<any>(null); // react-virtualized Listの参照
  const [currentCommentIndex, setCurrentCommentIndex] = useState<number>(0); // 現在のコメントインデックス
  const [debouncedTime, setDebouncedTime] = useState<number>(videoTime); // デバウンスされた再生時間
  const [isHidden, setIsHidden] = useState<boolean>(false);

  const fixedVideoTime = videoTime + commentDelay; // コメント遅延時間を考慮した再生時間

  // 動画の再生時間が変更されたときの処理
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTime(fixedVideoTime);
    }, 100); // 100msごとに更新

    return () => clearTimeout(timeout);
  }, [fixedVideoTime]);

  // 動画の再生時間に基づいて表示するコメントインデックスを計算
  useEffect(() => {
    const findCurrentCommentIndex = (fixedVideoTime: number) => {
      let index = 0;

      // コメントのvposが現在の再生時間より小さい最大のインデックスを探す
      for (let i = currentCommentIndex; i < comments?.length; i++) {
        if (comments[i].vpos <= fixedVideoTime * 100) {
          index = i;
        } else {
          break; // 条件を満たさない場合はループを抜ける
        }
      }

      // currentCommentIndex以降で満たさないコメントがあった場合、二分探索を実行
      // シークで移動した場合用
      if (comments[index].vpos > fixedVideoTime * 100) {
        let low = 0;
        let high = comments.length - 1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          if (comments[mid].vpos <= fixedVideoTime * 100) {
            index = mid;
            low = mid + 1; // 満たすインデックスを見つけたので、次のインデックスを調べる
          } else {
            high = mid - 1;
          }
        }
      }

      return index;
    };

    const index = findCurrentCommentIndex(debouncedTime);
    setCurrentCommentIndex(index);

    // 再生時間に合わせてスクロール
    if (listRef.current) {
      listRef.current.scrollToRow(index);
    }
  }, [debouncedTime, comments]);

  // 表示状態をトグルする関数
  const toggleVisibility = () => {
    setIsHidden((prev) => !prev);
    handleCommentListOpen();
  };

  // コメントのvposを「分:秒」形式に変換する関数
  const formatTime = (vpos: number) => {
    const minutes = Math.floor(vpos / 100 / 60); // 1秒=100vposなので1000で割り、さらに60で分に変換
    const seconds = Math.floor((vpos / 100) % 60); // 秒は100vpos単位なので10で割る（1000vpos = 1秒）
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  };

  // コメントを表示するための行を描画する関数
  const rowRenderer = ({ index, key, style }: any) => {
    const comment = comments[index];
    return (
      <Box
        key={key}
        style={style}
        sx={{ marginBottom: '2px', display: 'flex' /* maxWidth: '300px'*/ }}
      >
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
            >
              {formatTime(comment.vpos)} {/* vposを分:秒形式で表示 */}
            </Typography>
          </Grid>
          <Grid item xs={10}>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '0.7rem',
                marginLeft: '15px'
              }}
            >
              {comment.message}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    );
  };

  if (isHidden) {
    return (
      <Box>
        <OpenInFull onClick={toggleVisibility} sx={{ fontSize: '0.75rem' }}/>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: '500px', minWidth: '125px', maxWidth: '125px'}}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          marginBottom: '6px',
          gap: '30px',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: '0.6rem', minWidth:'25px'}}>
          時間
        </Typography>
        <Typography variant="body2" sx={{ fontSize: '0.6rem', minWidth:'45px', marginLeft: '-70px'}}>
          コメント
        </Typography>
        <Close onClick={toggleVisibility} sx={{ fontSize: '0.75rem', marginLeft: '-70px' }}/>
      </Box>

      <List
        ref={listRef}
        width={125} // リストの幅
        height={500} // リストの高さ
        rowCount={comments.length} // コメントの数
        rowHeight={25} // 各コメントの高さ
        rowRenderer={rowRenderer} // コメントのレンダリング
        scrollToIndex={currentCommentIndex} // 現在のコメントインデックスにスクロール
      />
    </Box>
  );
};

export default VideoComments;
