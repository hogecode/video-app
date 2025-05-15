
import { Request, Response, Router } from 'express';

import { Video } from '@prisma/client';

import { getVideoById, incrementVideoViews } from '../repositories/VideoRepository';
import { addWatchHistory } from '../repositories/WatchHistoryRepository';
import { convertXmlToJson } from '../services/CommentFileService';
import {
    mergeVideosWithComments, syncVideosAndXMLCommentFilesWithDatabase
} from '../services/FileService';
import { createHlsForVideoById, createHlsStreamFromFilePath } from '../services/VideoService';
import { checkHlsModeEnabled } from '../services/ConfigService';

// Memo: prefixは/api/stream
const router = Router();

/**
 * ビデオのHLSストリームを生成する
 * Memo: ストリームのURLはフロントで指定する
 * Memo: なぜか型エラーになるのでPromise<any>を指定
 */
router.get('/:id', async (req: Request, res: Response): Promise<any> => {

  const fileId = parseInt(req.params.id as string, 10);
  if (isNaN(fileId)) {
    return res.status(400).send('Invalid video ID');
  }
  
  try {
    checkHlsModeEnabled() && await createHlsForVideoById(fileId);
    return res.status(200).json({ message: 'HLS stream created' });
    
  } catch (error) {
    console.error('Failed to create HLS stream', error);
    return res.status(500).json({ message: 'Failed to create HLS stream' });
  }
});

export default router;