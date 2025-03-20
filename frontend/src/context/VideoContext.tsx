import React, {
    createContext, ReactNode, useCallback, useContext, useEffect, useState
} from 'react';
import { Video } from 'types'; // Video 型をインポート

import UseFetch from '../../src/hooks/UseFetch'; // UseFetch をインポート

// コンテキストの型
interface VideoContextType {
  videos: Video[];
  filteredVideos: Video[];
  selectedVideo: Video | null;
  setVideos: (videos: Video[]) => void;
  setSelectedVideo: (video: Video) => void;
  fetchVideos: () => Promise<void>;
  sortVideos: (
    key: 'fileName' | 'commentedDate',
    order: 'asc' | 'desc'
  ) => void;
  selectedYear: number | null;
  filterVideosByYear: (year: number | null) => void;
}

// コンテキストを作成
const VideoContext = createContext<VideoContextType | undefined>(undefined);

// Memo: プロップスの型を指定しないとエラーになる
interface VideoProviderProps {
  children: ReactNode; // `children` を追加
}

// コンテキストプロバイダーの作成
export const VideoProvider: React.FC<VideoProviderProps> = ({
  children,
}: {
  children: ReactNode;
}) => {
  // ローカルストレージから初期値を取得
  const [videos, setVideos] = useState<Video[]>(() =>
    JSON.parse(localStorage.getItem('videos') || '[]')
  );

  const [selectedVideo, setSelectedVideo] = useState<Video | null>(() =>
    JSON.parse(localStorage.getItem('selectedVideo') || 'null')
  );

  const [filteredVideos, setFilteredVideos] = useState<Video[]>(() => {
    const storedFilteredVideos = localStorage.getItem('filteredVideos');
    return storedFilteredVideos ? JSON.parse(storedFilteredVideos) : [];
  });

  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const storedSelectedYear = localStorage.getItem('selectedYear');
    return storedSelectedYear ? JSON.parse(storedSelectedYear) : null;
  });

  // 年別フィルタリング
  const filterVideosByYear = (year: number | null) => {
    setSelectedYear(year);
    if (year === null) {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(
        (video) => new Date(video.commentedDate).getFullYear() === year
      );
      setFilteredVideos(filtered);
    }
  };

  const sortVideos = (
    key: 'fileName' | 'commentedDate',
    order: 'asc' | 'desc'
  ) => {
    const sorted = [...filteredVideos].sort((a, b) => {
      let valA: string | number = key === 'fileName' ? a[key] : a[key] ? new Date(a[key]).getTime() : NaN;
      let valB: string | number = key === 'fileName' ? b[key] : b[key] ? new Date(b[key]).getTime() : NaN;
  
      // 'fileName' の場合、文字列をそのまま比較
      if (key === 'fileName') {
        valA = a[key];
        valB = b[key];
      } else {
        // 'commentedDate' の場合は日付を数値に変換
        valA = a[key] ? new Date(a[key]).getTime() : NaN;
        valB = b[key] ? new Date(b[key]).getTime() : NaN;
  
        // NaNの要素を最後に
        if (isNaN(Number(valA))) valA = Infinity;
        if (isNaN(Number(valB))) valB = Infinity;
      }
  
      // ソート順に基づいて比較
      if (order === 'asc') {
        return valA < valB ? -1 : 1;
      } else {
        return valA > valB ? -1 : 1;
      }
    });
  
    setFilteredVideos(sorted);
  };

  // 非同期で動画データを取得する関数
  const fetchVideos = useCallback(async () => {
    try {
      const videos: Video[] = await UseFetch<Video[]>('/api/files'); // APIから動画を取得
      setVideos(videos); // 取得した動画を状態にセット
      setFilteredVideos(videos);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  }, []);

  // ローカルストレージに保存（videosまたはselectedVideoが更新されたとき）
  useEffect(() => {
    if (videos.length > 0) {
      localStorage.setItem('videos', JSON.stringify(videos)); // videosをローカルストレージに保存
    }
  }, [videos]);

  useEffect(() => {
    if (selectedVideo) {
      localStorage.setItem('selectedVideo', JSON.stringify(selectedVideo)); // selectedVideoをローカルストレージに保存
    }
  }, [selectedVideo]);

  useEffect(() => {
    localStorage.setItem('filteredVideos', JSON.stringify(filteredVideos));
  }, [filteredVideos]);

  useEffect(() => {
    if (selectedYear !== null) {
      localStorage.setItem('selectedYear', JSON.stringify(selectedYear));
    }
  }, [selectedYear]);

  return (
    <VideoContext.Provider
      value={{
        videos,
        filteredVideos,
        selectedVideo,
        setVideos,
        setSelectedVideo,
        fetchVideos,
        sortVideos,
        selectedYear,
        filterVideosByYear,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

// useContextでコンテキストの状態を取得するカスタムフック
export const useVideoContext = (): VideoContextType => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
};
