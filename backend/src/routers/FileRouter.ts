//ToDo: prismaのフォルダからそのフォルダ内のファイル情報を返却
//Memo: HLSのURLはフロントで指定するのでStreamRouterは不要
//Memo: /files/:fileが叩かれた時にHLS関連の処理を行う
//Memo: CommentRouterも不要

import { Router, Request, Response } from 'express';
import {
  getVideoById,
  incrementVideoViews,
} from '../repositories/VideoRepository';
import { createHlsForVideos, createHlsStream } from '../services/VideoService';
import {
  mergeVideosWithComments,
  syncVideosAndXMLCommentFilesWithDatabase,
  syncXMLWithJson,
} from '../services/FileService';
import { addWatchHistory } from '../repositories/WatchHistoryRepository';
import { convertXmlToJson, convertXmlToJsonAndSave, readCommentJsonFile } from '../services/CommentFileService';
import { Video } from '@prisma/client';
import * as fs from 'fs';
import { COMMENT_DIR } from '../constants';
import path from 'path';

// Memo: prefixは/api/files
const router = Router();

// 動画一覧を取得するエンドポイント
// コメントファイルの情報(コメント日、コメント数など)を統合して返却
router.get('/', async (req: Request, res: Response) => {
  try {
    const videos = await mergeVideosWithComments(); // サービスファイル内の関数を呼び出す
    res.json(videos); // クライアントに動画のデータを返す
  } catch (error) {
    console.error('Error fetching videos in router:', error);
    res.status(500).json({ message: 'Failed to fetch videos' }); // エラーハンドリング
  }
});


/**
 * ビデオに関する情報を取得し、再生履歴を追加とコメントデータを返す
 * Memo: なぜか型エラーになるのでPromise<any>を指定
 * Refactor: 肥大化してるし、重いので見直す
 * @param req - HTTPリクエストオブジェクト
 * @param res - HTTPレスポンスオブジェクト
 * @returns ビデオ情報、HLSパス、コメントデータのJSONレスポンス
 */
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const idParam = req.params.id as string;
  if (!idParam) {
    return res.status(400).send('Invalid video ID');
  }

  const fileId = parseInt(idParam, 10); // パラメータからIDを取得して数値に変換

  // 無効なIDの場合、400エラーを返す
  if (isNaN(fileId)) {
    return res.status(400).send('Invalid video ID');
  }

  try {
    // 再生回数を1増やし、再生履歴を追加（並列化する）
    const [incrementViews, addHistory] = await Promise.all([
      incrementVideoViews(fileId),
      addWatchHistory(fileId),
    ]);

    // ビデオ情報を並列で取得
    const videoPromise = getVideoById(fileId);

    // XMLファイルがあればJSONファイルを返す、なければ生成
    const commentJsonPromise = (async () => {
      const video = await videoPromise; // ビデオ情報取得後に処理
      if (video?.filePath) {
        const xmlFilePath = video.filePath.replace(/\.[^/.]+$/, '.xml');
        const jsonFilePath = path.join(COMMENT_DIR, path.basename(xmlFilePath, '.xml') + '.json');
        console.log('ルーターでのjsonのファイルパスは', jsonFilePath);

        // まずJSONファイルが存在するか確認
        if (fs.existsSync(jsonFilePath)) {
          return readCommentJsonFile(jsonFilePath); // 存在すればそのまま返す

        } else {
          if (!fs.existsSync(xmlFilePath)) {
            return {}; // XMLファイルが存在しない場合、空のコメントJSON
          }
          console.log('JSONファイルが存在しません。XMLファイルから変換して保存します。');
        // JSONファイルが存在しない場合はXMLをJSONに変換して保存
          await convertXmlToJsonAndSave(xmlFilePath);
          return readCommentJsonFile(jsonFilePath); // 作成後に読み込んで返す
        }
      }
      return {}; // videoがない場合、空のコメントJSON
    })();

    // 並列で処理した結果を取得
    const video = await videoPromise;
    const CommentJson = await commentJsonPromise;

    if (!video) {
      return res.status(404).send('Video not found');
    }

    // 並列化された処理が完了したら、結果を返す
    return res.status(200).json({ video, CommentJson });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


/**
 * 監視するフォルダのmp4とxmlファイルをDBを同期し、HLSも作成し、動画一覧を取得するエンドポイント
 * Refactor: 順番に実行する必要がないなら、Promise.allで並列化する
 * Memo: とても重いのでGET / とエンドポイントを分ける(殆ど使わない)
 * Memo: コメントファイルの情報(コメント日、コメント数など)を統合して返却
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    await syncVideosAndXMLCommentFilesWithDatabase();
    const videos = await mergeVideosWithComments(); // サービスファイル内の関数を呼び出す
    await syncXMLWithJson(); // XMLファイルをJSONに変換
    await createHlsForVideos(); // ビデオのHLSを生成

    res.json(videos); // クライアントに動画のデータを返す

  } catch (error) {
    console.error('Error refreshing or fetching videos in router:', error);
    res.status(500).json({ message: 'Failed to refresh or fetch videos' }); // エラーハンドリング
  }
});

export default router;
