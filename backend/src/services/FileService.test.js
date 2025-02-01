
import * as fs from 'fs';
import * as path from 'path';
import * as ini from 'ini';
import { addVideo, deleteVideoByFilePath, getAllVideos } from '../repositories/VideoRepository';
import { addXMLCommentFile, deleteXMLCommentFileByFilePath, getAllXMLCommentFiles } from '../repositories/CommentRepository';
import { takeScreenshot } from './VideoService';
import { getCommentCount, getCommentTimestamp } from './CommentFileService';
import { mergeVideosWithComments, syncVideosAndXMLCommentFilesWithDatabase, syncVideosWithDatabase } from './FileService';

// モック
jest.mock('fs');
jest.mock('path');
jest.mock('ini');
jest.mock('../repositories/VideoRepository');
jest.mock('../repositories/CommentRepository');
jest.mock('./VideoService');
jest.mock('./CommentFileService');

describe('FileService Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks(); // 各テストの前にモックをリセット
  });

  describe('mergeVideosWithComments', () => {
    it('should merge video and comment data correctly', async () => {
      // モックデータ
      const mockVideos = [
        { filePath: 'path/to/video1.mp4', fileName: 'video1', views: 0, liked: false },
        { filePath: 'path/to/video2.mp4', fileName: 'video2', views: 0, liked: false },
      ];
      const mockXMLCommentFiles = [
        { filePath: 'path/to/video1.xml', commentCount: 5, commentedDate: '2021-01-01' },
        { filePath: 'path/to/video3.xml', commentCount: 3, commentedDate: '2021-02-01' },
      ];

      // モック関数
      getAllVideos.mockResolvedValue(mockVideos);
      getAllXMLCommentFiles.mockResolvedValue(mockXMLCommentFiles);

      // テスト対象関数の呼び出し
      const result = await mergeVideosWithComments();

      // 結果の検証
      expect(result).toEqual([
        { filePath: 'path/to/video1.mp4', fileName: 'video1', views: 0, liked: false, commentCount: 5, commentedDate: '2021-01-01' },
        { filePath: 'path/to/video2.mp4', fileName: 'video2', views: 0, liked: false },
      ]);
    });

    it('should handle empty comment data gracefully', async () => {
      const mockVideos = [
        { filePath: 'path/to/video1.mp4', fileName: 'video1', views: 0, liked: false },
      ];
      const mockXMLCommentFiles = [];

      // モック関数
      getAllVideos.mockResolvedValue(mockVideos);
      getAllXMLCommentFiles.mockResolvedValue(mockXMLCommentFiles);

      // テスト対象関数の呼び出し
      const result = await mergeVideosWithComments();

      // 結果の検証
      expect(result).toEqual([
        { filePath: 'path/to/video1.mp4', fileName: 'video1', views: 0, liked: false },
      ]);
    });
  });

  describe('syncVideosAndXMLCommentFilesWithDatabase', () => {
    it('should synchronize videos and XML files with the database', async () => {
      const mockSyncVideosWithDatabase = jest.spyOn(syncVideosWithDatabase, 'syncVideosWithDatabase');
      const mockSyncXMLCommentFilesWithDatabase = jest.spyOn(syncXMLCommentFilesWithDatabase, 'syncXMLCommentFilesWithDatabase');

      // テスト対象関数の呼び出し
      await syncVideosAndXMLCommentFilesWithDatabase();

      // モック関数の呼び出し確認
      expect(mockSyncVideosWithDatabase).toHaveBeenCalled();
      expect(mockSyncXMLCommentFilesWithDatabase).toHaveBeenCalled();
    });
  });

  describe('syncVideosWithDatabase', () => {
    it('should sync videos with the database correctly', async () => {
      // モックデータ
      const mockFolderPaths = ['folder1', 'folder2'];
      const mockExistingVideos = [
        { filePath: 'folder1/video1.mp4', fileName: 'video1', views: 0, liked: false },
      ];
      const mockMp4Files = ['folder1/video2.mp4'];

      // モック関数
      getFolderPaths.mockReturnValue(mockFolderPaths);
      getAllVideos.mockResolvedValue(mockExistingVideos);
      fs.promises.readdir.mockResolvedValue(mockMp4Files);
      takeScreenshot.mockResolvedValue('path/to/screenshot.png');
      addVideo.mockResolvedValue(undefined);

      // テスト対象関数の呼び出し
      await syncVideosWithDatabase();

      // 新しい動画が追加されたことを確認
      expect(addVideo).toHaveBeenCalled();
    });

    it('should handle errors in syncing videos gracefully', async () => {
      // モックデータ
      const mockFolderPaths = ['folder1'];
      const mockExistingVideos = [
        { filePath: 'folder1/video1.mp4', fileName: 'video1', views: 0, liked: false },
      ];
      const mockMp4Files = ['folder1/video2.mp4'];

      // モック関数
      getFolderPaths.mockReturnValue(mockFolderPaths);
      getAllVideos.mockResolvedValue(mockExistingVideos);
      fs.promises.readdir.mockResolvedValue(mockMp4Files);
      takeScreenshot.mockResolvedValue('path/to/screenshot.png');
      addVideo.mockRejectedValue(new Error('Failed to add video'));

      // テスト対象関数の呼び出し
      await syncVideosWithDatabase();

      // エラーがログに出力されていることを確認
      expect(console.error).toHaveBeenCalledWith('Failed to add video');
    });
  });

  describe('syncXMLCommentFilesWithDatabase', () => {
    it('should synchronize XML comment files with the database', async () => {
      // モックデータ
      const mockFolderPaths = ['folder1'];
      const mockExistingXMLCommentFiles = [
        { filePath: 'folder1/video1.xml', commentCount: 5, commentedDate: '2021-01-01' },
      ];
      const mockXmlFiles = ['folder1/video1.xml'];

      // モック関数
      getFolderPaths.mockReturnValue(mockFolderPaths);
      getAllXMLCommentFiles.mockResolvedValue(mockExistingXMLCommentFiles);
      fs.promises.readdir.mockResolvedValue(mockXmlFiles);
      getCommentCount.mockResolvedValue(5);
      getCommentTimestamp.mockResolvedValue('2021-01-01');
      addXMLCommentFile.mockResolvedValue(undefined);

      // テスト対象関数の呼び出し
      await syncXMLCommentFilesWithDatabase();

      // 新しいXMLコメントファイルが追加されたことを確認
      expect(addXMLCommentFile).toHaveBeenCalled();
    });
  });

});