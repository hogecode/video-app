//ToDo: hls機能、コメント表示は後ででいい
//ToDo: 動画の時間の変数をここで管理
//Refactor: componentsに後で分ける
//Fix: selectedVideoがundefinedになる

import 'plyr/dist/plyr.css'; // Plyr のスタイルもインポート
import './Video.css';

import CommentDelayControl from 'components/CommentDelayControl';
import CommentSearch from 'components/CommentSearch';
import VideoPlayerList from 'components/VideoPlayerList';
import { useSettings } from 'context/SettingsContext';
import { useVideoContext } from 'context/VideoContext';
import UseFetch from 'hooks/UseFetch';
import VideoPlayer from 'hooks/useHLSPlayer';
import React, { lazy, useEffect, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { Box, CircularProgress, Tab, Tabs } from '@mui/material';

import { STREAM_URL } from '../constants';
import { Comment } from '../types';
import TemplatePage from './TemplatePage';

// import VideoComments from 'components/VideoComments';

// タブのコンポーネントを遅延読み込み
const VideoMetaData = lazy(() => import('components/VideoMetaData'));
const VideoComments = lazy(() => import('components/VideoComments'));

const Video: React.FC = () => {
  // URLパラメータから動画のURLを取得
  const { videoId } = useParams<{ videoId: string }>(); // 動的パラメータで動画のIDを取得
  const { selectedVideo } = useVideoContext();
  const [hlsSource, setHlsSource] = useState<string>('');
  const [isDataFetched, setIsDataFetched] = useState(false); // データがフェッチされたかどうかを管理
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedTab, setSelectedTab] = useLocalStorage<string>(
    'selectedTab',
    'Meta Data'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [commentDelay, setCommentDelay] = useState<number>(0); // コメント遅延時間
  const { settings } = useSettings();
  const [videoHeight, setVideoHeight] = useState(250);
  const handleCommentDelay = (newDelay: number) => {
    setCommentDelay(newDelay);
  };

  // タブが切り替わったときの処理
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  };

  // 再生時間が変わったときに呼ばれる関数
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time); // 再生時間を更新
  };

  const filterComments = (
    comments: Comment[],
    ngPatterns: string[]
  ): Comment[] => {
    return comments.filter((comment) => {
      // comment.message が ngPatterns のどれかにマッチしていない場合にのみ残す
      return !ngPatterns.some((pattern) => {
        try {
          // 正規表現のパターンが"/"で囲まれている場合、これを元にRegExpオブジェクトを作成
          // 設定のngワードが正規表現でも文字列で保存されているため
          const regex =
            pattern.startsWith('/') && pattern.endsWith('/')
              ? new RegExp(pattern.slice(1, -1)) // フラグなし
              : new RegExp(pattern); // フラグあり

          // 正規表現をテスト
          return regex.test(comment.message);
        } catch (error) {
          // 無効な正規表現の場合、エラーハンドリング
          console.error('Invalid regular expression:', pattern);
          return false;
        }
      });
    });
  };

  // 最初のuseEffect（APIリクエスト）
  useEffect(() => {
    const fetchData = async () => {
      if (videoId) {
        try {
          // /api/files/:id にリクエスト
          setLoading(true);
          const filesResponse = await UseFetch<any>(`/api/files/${videoId}`);
          // console.log('Files API Response:', filesResponse);

          const allComments: Comment[] = filesResponse.CommentJson?.chats || []; // 取得したコメント
          const filteredComments = filterComments(
            allComments,
            settings.ngPatterns
          ); // NGワードを除外

          setComments(filteredComments); // コメントをセット

          // /api/stream/:id にリクエスト
          const streamResponse = await UseFetch<any>(`/api/streams/${videoId}`);
          // console.log('Stream API Response:', streamResponse);

          // データフェッチ完了フラグを更新
          setIsDataFetched(true);
          setCommentDelay(0); // コメント遅延時間をリセット
        } catch (error) {
          console.error('API Fetch Error:', error);
        }
      }
    };

    fetchData();
  }, [videoId]);

  // 2つ目のuseEffect（hlsSourceの更新）
  useEffect(() => {
    if (isDataFetched) {
      // videoIdが変更されたときにhlsSourceを更新
      //Fix: undefinedになる
      console.log('VideoContextのselectedVideo:' + selectedVideo);
      const videoFileName = selectedVideo?.fileName.replace(/\.mp4$/, ''); // .mp4を取り除く
      setHlsSource(`${STREAM_URL}/${videoFileName}/${videoFileName}.m3u8`); // hlsSourceを設定
      console.log(hlsSource);
      setLoading(false);
    }
  }, [isDataFetched, videoId, selectedVideo, hlsSource]); // isDataFetchedを依存関係に追加

  // Fix: なぜか動作しない
  // ページ離脱時に再生時間を保存
  /*
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 動画の現在の再生時間をローカルストレージに保存
      localStorage.setItem(`videoTime_${hlsSource}`, currentTime.toString());
    };

    // beforeunloadイベントリスナーを追加
    window.addEventListener('unload', handleBeforeUnload);

    // クリーンアップ: コンポーネントがアンマウントされる際にリスナーを解除
    return () => {
      window.removeEventListener('unload', handleBeforeUnload);
    };
  }, [hlsSource]);
  */

  // 初期表示時とリサイズ時に高さを調整する
  // Memo: ビデオの高さに合わせてコメントの高さを調整するため
  // flexが苦手なのでかなり強引な処理
  // Refactor: 重ければdebounceも検討
  useLayoutEffect(() => {
    const updateVideoHeight = () => {
      // `video` 要素を document.querySelector で取得
      const videoElement = document.querySelector('video');

      if (videoElement) {
        // `video` 要素の高さを取得
        setVideoHeight(videoElement.clientHeight);
      }
    };

    // Refactor: 可読性最悪なのでリファクタリング
    // レンダリング後に高さを取得するためにsetTimeoutで遅延
    const timeoutId = setTimeout(() => {
      updateVideoHeight();
    }, 300); // 少し遅れて実行

    // 初回で行かない場合があるのでもう一度・・・
    const timeoutId2 = setTimeout(() => {
      updateVideoHeight();
    }, 2000); // 少し遅れて実行

    const timeoutId3 = setTimeout(() => {
      updateVideoHeight();
    }, 3500); // 少し遅れて実行

    // 最後にもう一回・・・
    const timeoutId4 = setTimeout(() => {
      updateVideoHeight();
    }, 7000); // 少し遅れて実行

    // ウィンドウリサイズ時に高さを再計算
    window.addEventListener('resize', updateVideoHeight);

    // クリーンアップでリサイズイベントリスナーを削除
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(timeoutId4);
      window.removeEventListener('resize', updateVideoHeight);
    };
  }, []); //

  // ローディング中に表示するスピナー
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center', // 水平中央
          alignItems: 'center', // 垂直中央
          height: '100vh', // ビューポート全体の高さを占める
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TemplatePage>
      <Box
        sx={{
          display: 'flex',
          gap: '10px',
          maxHeight: '100vh',
          width: '100%',
          alignItems: 'stretch', // 高さを揃える
        }}
      >
        {/* VideoPlayerコンポーネント */}
        <Box sx={{ maxWidth: '850px', flexGrow: 1 }}>
          <VideoPlayer source={hlsSource} onTimeUpdate={handleTimeUpdate} />
        </Box>

        {/* VideoComments */}
        {comments && comments.length > 0 && (
          <Box
            sx={{
              display: { xs: 'none', sm: 'block' }, // スマホでは非表示、sm以上でblock表示にできれば固い
              overflowY: 'hidden', // コメントが多すぎる場合のスクロール
              height: videoHeight, // 動的に取得した高さを指定
            }}
          >
            <VideoComments
              comments={comments}
              videoTime={currentTime}
              commentDelay={commentDelay}
            />
          </Box>
        )}
      </Box>
      <Box sx={{ width: '100%' }}>
        {/* タブ */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Video player tabs"
        >
          <Tab label="動画データ" value="Meta Data" />
          <Tab label="コメント" value="Video Comments" />
          <Tab label="コメント遅延" value="CommentDelayControl" />
          <Tab label="コメント検索" value="CommentSearch" />
          <Tab label="ビデオリスト" value="Video List" />
        </Tabs>

        {/* タブに応じたコンテンツの表示 */}
        {selectedTab === 'Meta Data' && (
          <Box sx={{ marginTop: 2 }}>
            <VideoMetaData selectedVideo={selectedVideo} />
          </Box>
        )}
        {selectedTab === 'Video Comments' &&
          comments &&
          comments.length > 0 && (
            <Box sx={{ marginTop: 2, maxHeight: '250px', overflow: 'hidden' }}>
              <VideoComments
                comments={comments || []}
                videoTime={currentTime}
                commentDelay={commentDelay}
              />
            </Box>
          )}
        {selectedTab === 'CommentSearch' && (
          <Box sx={{ marginTop: 2 }}>
            <CommentSearch comments={comments || []} />
          </Box>
        )}
      </Box>
      {selectedTab === 'Video List' && (
        <Box sx={{ marginTop: 2 }}>
          <VideoPlayerList />
        </Box>
      )}
      {selectedTab === 'CommentDelayControl' && (
        <Box sx={{ marginTop: 2 }}>
          <CommentDelayControl
            currentTime={currentTime}
            comments={comments || []}
            commentDelay={commentDelay}
            handleCommentDelay={handleCommentDelay}
          />
        </Box>
      )}
    </TemplatePage>
  );
};

export default Video;
