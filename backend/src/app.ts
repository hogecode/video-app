import compression from 'compression';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import etag from 'etag';

import { BUILT_HTML_DIR, STATIC_DIR } from './constants';
import logger from './logs/logger';
import FileRouter from './routers/FileRouter';
import StreamRouter from './routers/StreamRouter';
import WatchHistoryRouter from './routers/WatchHistoryRouter';
import {
  getFolderPaths,
  syncVideosAndXMLCommentFilesWithDatabase,
  syncXMLWithJson,
} from './services/FileService';
import { createHlsForVideos } from './services/VideoService';

// Expressアプリケーションの初期化
const app = express();

const port = 3002;

// Memo: 自己ホストアプリだしセキュリティの心配はあまりない
app.options('*', cors());

// 重いエンドポイントがあるので圧縮を有効にする
// Memo: gzipはJSONには有効だが、バイナリには効果が薄い
app.use(compression());

app.use((req, res, next) => {
  res.setHeader('ETag', etag(JSON.stringify(res.json)));
  next();
});

// ミドルウェア定義
// Refactor: ミドルウェアフォルダへ移動

// ログ用ミドルウェア（リクエストのログを表示）
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} リクエスト ${req.url}`);
  next(); // 次のハンドラーに処理を渡す
});

// console.errorをwinstonで上書きしてファイル出力するミドルウェア
app.use((req: Request, res: Response, next: NextFunction) => {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    // argsを文字列に変換してwinstonで記録
    logger.error(
      args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
        .join(' ')
    );

    // 元のconsole.errorも呼び出す
    originalConsoleError.apply(console, args);
  };

  next();
});

// 初期化処理
// ffmpeg と ffprobe のパスを設定
const setFfmpegPath = () => {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-staticが見つかりません');
  }
  ffmpeg.setFfmpegPath(ffmpegPath);
  ffmpeg.setFfprobePath(ffmpegPath);
  console.log('ffmpegのパスを設定しました');
};
setFfmpegPath();

// フォルダとDBとの同期を実行
// Memo: トップレベルawaitは許可されないので関数を作成
async function executeSyncFunctions() {
  await syncVideosAndXMLCommentFilesWithDatabase(); // 最初の非同期関数が完了するまで待つ
  await syncXMLWithJson(); // 最後の非同期関数が完了するまで待つ
  await createHlsForVideos(); // 次の非同期関数が完了するまで待つ
}

// 実行
executeSyncFunctions();

// ルーターインポート
app.use('/api/files', FileRouter);
app.use('/api/history', WatchHistoryRouter);
app.use('/api/streams', StreamRouter);

// 静的ファイル配信
// /streamsの形でHLSを配信する
// assets/screenshots/sample03.png, assets/stream/sample01/sample01.m3u8
app.use('/assets', express.static(STATIC_DIR, { maxAge: '1d' }));

// getFolderPaths() を使ってすべてのパスを取得
// Refactor: これではまだ特殊文字(#)などに対応できない
const folderPaths = getFolderPaths();

folderPaths.forEach((folderPath) => {
  // folderPathからフォルダ名を取り出してURLのプリフィックスに使う
  const folderName = path.basename(folderPath);

  const encodedFolderName = encodeURIComponent(folderName); // フォルダ名をエンコード
  app.use(`/folders/${encodedFolderName}`, express.static(folderPath));
});

// Memo: 一時的に/staticに変更
// reactのビルドファイルを配信する
app.use('/static', express.static(path.join(BUILT_HTML_DIR, 'static')));

// service-worker.js エンドポイントを設定
app.get('/service-worker.js', (req, res) => {
  const serviceWorkerPath = path.join(BUILT_HTML_DIR, 'serviceWorker.js');
  res.sendFile(serviceWorkerPath);
});

//Reactアプリのindex.htmlを提供
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(BUILT_HTML_DIR, 'index.html'));
});

// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しています`);
});
