import express, { Request, Response } from 'express';
import { checkHlsModeEnabled } from '../services/ConfigService';
import { generateCertificate } from '../services/CetrificateService';

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

router.get('/generate-cert', (req: Request, res: Response) => {
  const clientIp = req.ip;
  console.log(`証明書を要求したClient IPは: ${clientIp}`);

  // 証明書と鍵を生成
  const { privateKeyPem, certificatePem } = generateCertificate(clientIp);

  // 証明書と秘密鍵をレスポンスとして返す
  res.json({
    certificate: certificatePem,
  });
});

export default router;
