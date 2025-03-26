import compression from 'compression';
import cors from 'cors';
import etag from 'etag';
import express, { NextFunction, Request, Response } from 'express';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

import { BUILT_HTML_DIR, STATIC_DIR } from './constants';
import logger from './logs/logger';
import FileRouter from './routers/FileRouter';
import StreamRouter from './routers/StreamRouter';
import WatchHistoryRouter from './routers/WatchHistoryRouter';
import {
    syncVideosAndXMLCommentFilesWithDatabase, syncXMLWithJson
} from './services/FileService';
import { checkHlsModeEnabled, getFolderPaths, loadHlsModeSetting } from './services/ConfigService';
import { createHlsForVideos } from './services/VideoService';
import { etagMiddleware } from './middleware/etagMiddleware';
import { errorLoggerMiddleware } from './middleware/errorLoggerMiddleware';
import { requestLoggerMiddleware } from './middleware/requestLoggerMiddleware';
import { cacheMiddleware } from './middleware/cacheMiddleware';

// Expressアプリケーションの初期化
const app = express();

const port = 3002;


// 外部ライブラリのミドルウェアを設定
// CORS関連の設定
// Memo: 自己ホストアプリだしセキュリティの心配はあまりない
app.use(cors({
  origin: '*', // 全てのオリジンを許可
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 許可するHTTPメソッド
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // 許可するHTTPヘッダー
  preflightContinue: false, // プリフライトリクエストに対して応答しない
  optionsSuccessStatus: 200 // OPTIONSリクエストに200ステータスを返す
}));

app.options('*', cors());

// 重いエンドポイントがあるので圧縮を有効にする
// Memo: gzipはJSONには有効だが、バイナリには効果が薄い
app.use(compression());


// 自作のミドルウェアを設定
// ETagミドルウェア
app.use(etagMiddleware);

// ロギングミドルウェア
app.use(requestLoggerMiddleware);

// console.logをwinstonでラップするミドルウェア
app.use(errorLoggerMiddleware);

// APIキャッシュミドルウェアの設定
// Fix: 変更の実装の見直し
app.use(cacheMiddleware);


// 初期化処理
// ffmpeg と ffprobe のパスを設定
// Memo: これを設定しないとffmpegとffprobeが初期化されない
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
  await syncVideosAndXMLCommentFilesWithDatabase(); 
  await syncXMLWithJson(); 
  checkHlsModeEnabled() && await createHlsForVideos();

}

executeSyncFunctions();

loadHlsModeSetting();
console.log(checkHlsModeEnabled() ? 'HLS Mode is enabled' : 'HLS Mode is not enabled');


// ルーターインポート
app.use('/api/files', FileRouter);
app.use('/api/history', WatchHistoryRouter);
app.use('/api/streams', StreamRouter);


// 静的ファイル配信
// /streamsの形でHLSを配信する
// assets/screenshots/sample03.png, assets/stream/sample01/sample01.m3u8
app.use('/assets', express.static(STATIC_DIR, { maxAge: '1d' }));

// getFolderPaths() を使ってすべてのパスを取得
// mp4での配信のために設定
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

app.get('/service-worker.js', (req, res) => {
  const serviceWorkerPath = path.join(BUILT_HTML_DIR, 'service-worker.js');
  res.sendFile(serviceWorkerPath);
});

app.get('/manifest.json', (req, res) => {
  const manifestJsonPath = path.join(BUILT_HTML_DIR, 'manifest.json');
  res.sendFile(manifestJsonPath);
});

//Reactアプリのindex.htmlを提供
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(BUILT_HTML_DIR, 'index.html'));
});


// サーバーの起動
app.listen(port, () => {
  console.log(`サーバーが http://localhost:${port} で起動しています`);
});
