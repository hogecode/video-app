import 'plyr/dist/plyr.css'; // Plyr のスタイルもインポート
import './Video.css';

import CommentDelayControl from 'components/CommentDelayControl';
import CommentSearch from 'components/CommentSearch';
import VideoPlayerList from 'components/VideoPlayerList';
import { useSettings } from 'context/SettingsContext';
import { useVideoContext } from 'context/VideoContext';
import UseFetch from 'hooks/UseFetch';
import VideoPlayer from 'hooks/useVideoPlayer';
import React, { lazy, startTransition, useEffect, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { Box, CircularProgress, Tab, Tabs } from '@mui/material';

import { HLS_STREAM_URL, MP4_STREAM_URL } from '../constants';
import { Comment } from '../types';
import TemplatePage from './TemplatePage';
import { CommentRounded, ListAlt, Search, Timer, VideoLibrary } from '@mui/icons-material';
import { useHlsMode } from 'context/HlsModeContext';

// タブのコンポーネントを遅延読み込み
const VideoMetaData = lazy(() => import('components/VideoMetaData'));
const VideoComments = lazy(() => import('components/VideoComments'));

const Video: React.FC = () => {

  const { videoId } = useParams<{ videoId: string }>();
  const { selectedVideo } = useVideoContext();
  const { settings } = useSettings();
  const { hlsMode } = useHlsMode();
  
  const [videoSource, setVideoSource] = useState<string>('');
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [commentDelay, setCommentDelay] = useState<number>(0); //コメント遅延秒数
  const [videoHeight, setVideoHeight] = useState(300); // videoタグの高さを取得
  const [fileResponse, setFileResponse] = useState(null);

  const [selectedTab, setSelectedTab] = useLocalStorage<string>('selectedTab', 'Meta Data');


  const handleCommentDelay = (newDelay: number) => {
    setCommentDelay(newDelay);
  };

  // タブが切り替わったときの処理
  // 稀に画面が停止するのでstartTransitionを利用
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    startTransition(() => {
      setSelectedTab(newValue);
    });
  };

  // 再生時間が変わったときに呼ばれる関数
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time); // 再生時間を更新
  };

  // NGワードを除去する関数
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
          const fileResponse = await UseFetch<any>(`/api/files/${videoId}`);
          setFileResponse(fileResponse);
          console.log('Files API Response:', fileResponse);

          const allComments: Comment[] = fileResponse.CommentJson?.chats || []; // 取得したコメント
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


  // 2つ目のuseEffect(hlsSourceの更新）
  // 一個目のuseEffectが完了してから処理を行いたいため
  useEffect(() => {
    if (!isDataFetched) return; 

    console.log('VideoContextのselectedVideo:', selectedVideo);
    
    // HLSモードが無効な場合、MP4のソースを設定
    if (!hlsMode) {
      console.log('fileResponse: ', fileResponse);
      const folder = fileResponse?.video.folderPath.split(/[/\\]/).pop();// 最後の部分（フォルダ名）を取得
      const encodedFolderName = encodeURIComponent(folder); // フォルダ名をエンコード
      const videoFileName = selectedVideo?.fileName;
      
      // MP4動画のソースURLを設定
      setVideoSource(`${MP4_STREAM_URL}/${encodedFolderName}/${videoFileName}`);

      // HLSモードの場合の処理
    } else {
      const videoFileName = selectedVideo?.fileName.replace(/\.mp4$/, ''); // .mp4を取り除く
      setVideoSource(`${HLS_STREAM_URL}/${videoFileName}/${videoFileName}.m3u8`); // HLSのソースを設定
    }
      
      console.log('videoSource: ', videoSource);
      setLoading(false);
  }, [isDataFetched, videoSource, videoId, selectedVideo]);  // isDataFetchedを依存関係に追加


  // 初期表示時とリサイズ時に高さを調整する
  // Memo: ビデオの高さに合わせてコメントの高さを調整するため
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
          <VideoPlayer source={videoSource} onTimeUpdate={handleTimeUpdate} />
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
          centered
        >
          <Tab value="Meta Data" icon={<ListAlt />} iconPosition="start" />
          <Tab
            value="Video Comments"
            icon={<CommentRounded />}
            iconPosition="start"
          />
          <Tab
            value="CommentDelayControl"
            icon={<Timer />}
            iconPosition="start"
          />
          <Tab value="CommentSearch" icon={<Search />} iconPosition="start" />
          <Tab
            value="Video List"
            icon={<VideoLibrary />}
            iconPosition="start"
          />
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
