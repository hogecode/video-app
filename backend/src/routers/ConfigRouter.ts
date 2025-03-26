import express, { Request, Response } from 'express';
import { checkHlsModeEnabled } from '../services/ConfigService';

const router = express.Router();

/** HLSモードが有効かどうかを取得するエンドポイント 
 * フロントで型定義しているので/エンドポイントとは分ける
 * 
*/
router.get('/', async (req: Request, res: Response) => {
  try {
    // HLSモードの状態を確認
    const isHlsModeEnabled = checkHlsModeEnabled();
    // HLSモードの状態をレスポンスとして返す
    res.json({ isHlsModeEnabled });
  } catch (error) {
    console.error('Error checking HLS mode:', error);
    res.status(500).json({ message: 'Failed to check HLS mode' });
  }
});

export default router;