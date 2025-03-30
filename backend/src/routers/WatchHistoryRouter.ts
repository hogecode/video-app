/**
 * 再生履歴取得、削除するルーター
 * ToDo: 再生履歴を取得するエンドポイントを作成
 * Memo: 再生履歴を取得 → マージする関数を作る必要があるので面倒
 */

import { Request, Response, Router } from 'express';

import {
  deleteAllWatchHistory,
  deleteWatchHistoryById,
  getAllWatchHistory,
} from '../repositories/WatchHistoryRepository';

const router = Router();

/**
 * 全ての再生履歴を取得するエンドポイント
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const watchHistory = await getAllWatchHistory(); 

    res.json(watchHistory); 
  } catch (error) {
    console.error('Error fetching watch history in router:', error);
    res.status(500).json({ message: 'Failed to fetch watch history' }); 
  }
});


/**
 * 全ての再生履歴を削除するエンドポイント
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const videos = await deleteAllWatchHistory(); // サービスファイル内の関数を呼び出す

    res.json({ message: `ビデオが${videos}個削除されました` });
  } catch (error) {
    console.error('Error deleting videos in router:', error);
    res.status(500).json({ message: 'Failed to delete videos' }); // エラーハンドリング
  }
});


/**
 * 指定した再生履歴を削除するエンドポイント
 */
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const historyId = parseInt(req.params.id as string, 10);

  // IDが無効な場合はエラーレスポンスを返す
  if (isNaN(historyId)) {
    return res.status(400).send('Invalid video ID');
  }

  try {
    const videos = await deleteWatchHistoryById(historyId); 
    res.json({ message: `ビデオが${videos}個削除されました` });

  } catch (error) {
    console.error('Error deleting video history in router:', error);
    res.status(500).json({ message: 'Failed to delete video history' }); 
  }
});

export default router;
