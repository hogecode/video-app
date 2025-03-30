//Memo: HLSのURLはフロントで指定するのでStreamRouterは不要

import { Request, Response, Router } from 'express';
import * as fs from 'fs';
import path from 'path';

import { Video } from '@prisma/client';

import { COMMENT_DIR } from '../constants';
import { getVideoById, incrementVideoViews } from '../repositories/VideoRepository';
import { addWatchHistory } from '../repositories/WatchHistoryRepository';
import {
    convertXmlToJson, convertXmlToJsonAndSave, readCommentJsonFile
} from '../services/CommentFileService';
import {
    mergeVideosWithComments, syncVideosAndXMLCommentFilesWithDatabase, syncXMLWithJson
} from '../services/FileService';
import { createHlsForVideos, createHlsStreamFromFilePath } from '../services/VideoService';
import { checkHlsModeEnabled } from '../services/ConfigService';
import { getCommentJson } from '../services/FileReadService';
import { cacheMiddleware, clearCache } from '../middleware/cacheMiddleware';

// Memo: prefixは/api/files
const router = Router();

/** 動画一覧を取得するエンドポイント
 *  コメントファイルの情報(コメント日、コメント数など)を統合して返却
*/
router.get('/', cacheMiddleware, async (req: Request, res: Response) => {
  try {
    const videos = await mergeVideosWithComments(); 
    res.json(videos); 
  } catch (error) {
    console.error('Error fetching videos in router:', error);
    res.status(500).json({ message: 'Failed to fetch videos' }); 
  }
});


/**
 * ビデオに関する情報を取得し、再生履歴を追加とコメントデータを返す
 * Memo: なぜか型エラーになるのでPromise<any>を指定
 * Refactor: 肥大化してるし、重いので見直す
 * @returns ビデオ情報、HLSパス、コメントデータのJSONレスポンス
 */
router.get('/:id', cacheMiddleware, async (req: Request, res: Response): Promise<any> => {

  // パラメータからIDを取得して数値に変換
  const fileId = parseInt(req.params.id as string, 10);

  // 無効なIDの場合、400エラーを返す
  if (isNaN(fileId)) {
    return res.status(400).send('Invalid video ID');
  }

  try {
    // 再生回数を1増やし、再生履歴を追加
    await Promise.all([
      incrementVideoViews(fileId),
      addWatchHistory(fileId),
    ]);

    // ビデオ情報を取得
    const video = await getVideoById(fileId);

    if (!video) {
      return res.status(404).send('Video not found');
    }

    const commentJson = await getCommentJson(video?.filePath);
    
    // 並列化された処理が完了したら、結果を返す
    return res.status(200).json({ video, CommentJson: commentJson });

  } catch (error) {
    console.error('Failed to fetch mp4 or Json comments:', error);
    return res.status(500).json({ message: 'Failed to fetch mp4 or Json comments' });
  }
});


/**
 * 監視するフォルダのmp4とxmlファイルをDBを同期し、HLSも作成するエンドポイント
 * Refactor: 順番に実行する必要がないなら、Promise.allで並列化する
 * Memo: とても重いのでGET / とエンドポイントを分ける(殆ど使わない)
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    await Promise.all([
      syncVideosAndXMLCommentFilesWithDatabase(),
      mergeVideosWithComments(),
      checkHlsModeEnabled() && createHlsForVideos()
    ]);

    clearCache("/api/files");
    
    res.status(200).json({ message: 'Refresh completed' }); 

  } catch (error) {
    console.error('Error refreshing or fetching videos in router:', error);
    res.status(500).json({ message: 'Failed to refresh or fetch videos' }); 
  }
});

export default router;
