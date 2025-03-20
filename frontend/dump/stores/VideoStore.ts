
import { Video } from 'types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import UseFetch from '../../src/hooks/UseFetch';

// ストアの型
interface VideoStore {
  videos: Video[];
  selectedVideo: Video | null;
  setVideos: (videos: Video[]) => void;
  setSelectedVideo: (video: Video) => void;
  fetchVideos: () => Promise<void>;
}

// `zustand`のストアを永続化するために`persist`ミドルウェアを使用
const useVideoStore = create<VideoStore>()(
  persist(
    (set) => ({
      videos: [], // 初期値として空の配列
      selectedVideo: null,

      setVideos: (videos) => set({ videos }),
      setSelectedVideo: (video) => set({ selectedVideo: video }),

      // 非同期で動画データを取得する関数
      fetchVideos: async () => {
        try {
          //Memo: 大文字じゃなくとエラーになる
          const videos: Video[] = await UseFetch<Video[]>('/api/files'); 
          set({ videos });
        } catch (error) {
          console.error('Failed to fetch videos:', error);
        }
      },
    }),
    { // Memo: storageやgetStorageは不要
      name: 'video-files', // ローカルストレージのキー名
    }
  )
);

export default useVideoStore;

