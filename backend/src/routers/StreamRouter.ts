
import { Request, Response, Router } from 'express';

import { Video } from '@prisma/client';

import { getVideoById, incrementVideoViews } from '../repositories/VideoRepository';
import { addWatchHistory } from '../repositories/WatchHistoryRepository';
import { convertXmlToJson } from '../services/CommentFileService';
import {
    mergeVideosWithComments, syncVideosAndXMLCommentFilesWithDatabase
} from '../services/FileService';
import { createHlsForVideoById, createHlsStream } from '../services/VideoService';

// Memo: prefixは/api/stream
const router = Router();

/**
 * ビデオのHLSストリームのパスを返す
 * Memo: なぜか型エラーになるのでPromise<any>を指定
 * Memo: 3秒近くレスポンスがかかってしまう
 * Refactor: レスポンスを実際のHLSパスに変更
 * @param req - HTTPリクエストオブジェクト
 * @param res - HTTPレスポンスオブジェクト
 * @returns HLSパスのJSONレスポンス
 */
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const idParam = req.params.id as string;
  if (!idParam) {
    return res.status(400).send('Invalid video ID');
  }

  const fileId = parseInt(idParam, 10);  // パラメータからIDを取得して数値に変換

  // 無効なIDの場合、400エラーを返す
  if (isNaN(fileId)) {
    return res.status(400).send('Invalid video ID');
  }
  
  try {
    /*
    // 指定IDのビデオを取得
    const video: Video | null = await getVideoById(fileId);

    // video が存在しない場合、404エラーを返す
    if (!video) {
      return res.status(404).send('Video not found');
    }

    // HLSストリームを作成する
    let hlsPath: string | null = null;
    if (video.filePath) {
      hlsPath = await createHlsStream(video.filePath);
    }
    */

    await createHlsForVideoById(fileId);

    // ビデオ情報、HLSパス、コメントJSONを返す
    return res.status(200).json({ message: 'HLS stream created' });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;