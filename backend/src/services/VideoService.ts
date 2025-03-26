/**
 * ffmpeg関連の処理を記述するファイル
 * サムネ生成、HLS配信など
 */

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

import { SCREENSHOT_DIR, STREAM_DIR } from '../constants';
import { getAllVideos, getVideoById } from '../repositories/VideoRepository';

/**
 * 動画の長さを取得する関数（秒単位）
 * ToDo: 出来ればvideoテーブルに再生時間も保存したい
 * Memo: 時間に応じてスクショする箇所を調整するために使用
 * Fix: Unrecognized option 'show_streams'.
 * Fix: Error splitting the argument list: Option not found
 * Memo: エラーが出て動かないので使わない
 * @param {string} videoFilePath - 動画ファイルのパス
 * @returns {Promise<number>} - 動画の長さ（秒）
 */
/*
async function getVideoDuration(videoFilePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoFilePath)
      .ffprobe((err, metadata) => {
        console.log('再生時間を取得するビデオのパスは', videoFilePath);

        if (err) {
          console.error('Error retrieving video metadata:', err);
          reject(new Error('Error retrieving video metadata'));
          return;
        }

        // メタデータに再生時間が含まれている場合
        if (metadata && metadata.format && metadata.format.duration !== undefined) {
          resolve(metadata.format.duration);
          console.log('再生時間は', metadata.format.duration, '秒です');
          console.log('getVideoDuration()の処理が完了しました');
        } else {
          console.error('Duration not found in video metadata');
          reject(new Error('Duration not found in video metadata'));
        }
      })
  });
}
*/

/**
 * 動画からスクリーンショットを取得して指定されたフォルダに保存する関数
 * @param {string} videoFilePath - スクリーンショットを取得する動画ファイルのパス
 * @returns {Promise<string>} - 保存されたスクリーンショットのファイルパス
 */
export async function takeScreenshot(videoFilePath: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    // 出力先ディレクトリが存在しない場合は作成
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      console.log(
        'スクリーンショットの保存先ディレクトリを作成しました',
        SCREENSHOT_DIR
      );
    }

    // 動画ファイル名からスクリーンショットのファイル名を決定
    const videoFileName = path.basename(
      videoFilePath,
      path.extname(videoFilePath)
    );

    // 動画の長さを取得
    /*
     const duration = await getVideoDuration(videoFilePath);
    
    // 通常は05:00でスクリーンショット、それより短い場合は01:00でスクリーンショット
    let timestamp = '00:05:00';  // デフォルトで5分
    if (duration < 300) {  // 300秒未満（5分未満）の場合
      timestamp = '00:00:05';
    }
    const screenshotFileName = `${videoFileName}-${timestamp.replace(":", "-")}.png`;
    */

    const screenshotFileName = `${videoFileName}.png`;
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotFileName);
    console.log('スクリーンショットを', screenshotPath, 'に保存します');

    // FFmpegコマンドでスクリーンショットを取得
    ffmpeg(videoFilePath)
      .screenshots({
        timestamps: ['10'], // Refactor: 後で20%などに固定したい
        filename: screenshotFileName, // スクリーンショットのファイル名
        folder: SCREENSHOT_DIR, // 保存先フォルダ
        size: '1280x720', // 画像サイズ
      })
      .on('end', () => {
        console.log(`Screenshot saved to: ${screenshotPath}`);
        resolve(screenshotPath); // スクリーンショットのファイルパスを返す
      })
      .on('error', (err) => {
        console.error('Error taking screenshot:', err);
        reject(new Error('Failed to take screenshot'));
      });
  });
}

/**
 * 動画をHLS形式でストリーミング可能な.m3u8と.tsセグメントに変換する関数
 * Memo: 動画IDから動画パスを取得する処理をラップする必要
 * @param videoID - 入力動画ファイルのパス
 * @returns {Promise<string>} - 作成された.m3u8ファイルのパス
 */
export async function createHlsStreamFromFilePath(videoFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // 動画のファイル名からフォルダ名を生成
    const videoFileName = path.basename(
      videoFilePath,
      path.extname(videoFilePath)
    );

    // 動画ごとの専用フォルダを作成
    const outputDir = path.join(STREAM_DIR, videoFileName);

    // 出力ディレクトリが存在しない場合は作成
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // .m3u8ファイルのパスを設定
    const m3u8FileName = `${videoFileName}.m3u8`;
    const outputFilePath = path.join(outputDir, m3u8FileName);

    // HLSのストリーミング設定
    ffmpeg(videoFilePath)
      .outputOptions([
        '-preset veryfast', // エンコード速度（変更可能）
        '-g 60', // GOPサイズ（キーフレームの間隔）
        '-sc_threshold 0', // スライディングウィンドウのサイズ
        '-hls_time 10', // 1つのTSセグメントの長さ（秒）
        '-hls_list_size 0', // m3u8プレイリストに記載するセグメント数（0で全て）
        '-hls_segment_filename',
        path.join(outputDir, `${videoFileName}-%03d.ts`), // セグメントファイルの命名規則
      ])
      .output(outputFilePath)
      .on('end', () => {
        console.log(`HLS streaming created successfully: ${outputFilePath}`);
        resolve(outputFilePath); // m3u8ファイルのパスを返す
      })
      .on('error', (err) => {
        // エラーを伝搬させる必要はない
        console.error('Error creating HLS stream:', err);  
      })
      .run();
  });
}


/**
 * 拡張子を除いたファイル名を受け取り、そのディレクトリ内のファイルを削除する関数
 * config.iniでフォルダを監視しなくなった場合やmp4ファイルが消された時に呼び出す
 */
export async function cleanupHlsFiles(fileName: string): Promise<void> {
  try {
    // ファイル名から拡張子を除いた名前を取得
    const baseName = path.parse(fileName).name;

    // STREAM_DIRと連結してディレクトリパスを作成
    const targetDir = path.join(STREAM_DIR, baseName);

    // 指定されたディレクトリが存在するか確認
    if (fs.existsSync(targetDir)) {
      console.log(`Deleting folder and its contents: ${targetDir}`);

      // フォルダ内のすべてのファイルとサブディレクトリを再帰的に削除
      await fs.promises.rm(targetDir, { recursive: true, force: true });
      console.log(`Deleted folder and its contents: ${targetDir}`);
    } else {
      console.log(`Directory not found: ${targetDir}`);
    }
  } catch (err) {
    console.error('Error deleting folder:', err);
  }
}


/**
 * データベースから動画を取得し、対応する .m3u8 ファイルが存在しない場合にHLSを作成する関数
 */
export async function createHlsForVideos(): Promise<void> {
  try {
    // データベースからすべての動画情報を取得
    const videos = await getAllVideos();

    // 取得した動画情報を順に処理
    for (const video of videos) {
      try {
        // 動画のファイルパスから拡張子を除いたファイル名を取得
        const baseFileName = path.basename(
          video.filePath,
          path.extname(video.filePath)
        );

        // 対応する .m3u8 ファイルのパスを作成
        const hlsFilePath = path.join(
          STREAM_DIR,
          baseFileName,
          `${baseFileName}.m3u8`
        );

        // .m3u8 ファイルがすでに存在するか確認
        if (fs.existsSync(hlsFilePath)) {
          continue; // 既に作成されている場合はスルー
        }

        console.log(`HLSストリームを作成しています: ${video.filePath}`);

        // .m3u8ファイルが存在しない場合、HLSを作成
        const hlsStream = await createHlsStreamFromFilePath(video.filePath);
        console.log(
          `全ての動画のHLSストリームの作成が完了しました: ${hlsStream}`
        );
      } catch (error) {
        console.error(`動画 ${video.filePath} のHLS作成に失敗しました:`, error);
      }
    }
  } catch (error) {
    console.error(
      'データベースから動画情報を取得する際にエラーが発生しました:',
      error
    );
  }
}

/**
 * 動画 ID に基づいて、対応する .m3u8 ファイルが存在しない場合にHLSを作成する関数
 */
export async function createHlsForVideoById(videoId: number): Promise<void> {
  try {
    // データベースから動画 ID に基づく動画情報を取得
    const video = await getVideoById(videoId);

    if (!video) {
      console.log(`動画ID ${videoId} の情報が見つかりません。`);
      return; // 動画が見つからなかった場合は処理を中止
    }

    try {
      // 動画のファイルパスから拡張子を除いたファイル名を取得
      const baseFileName = path.basename(
        video.filePath,
        path.extname(video.filePath)
      );

      // 対応する .m3u8 ファイルのパスを作成
      const hlsFilePath = path.join(
        STREAM_DIR,
        baseFileName,
        `${baseFileName}.m3u8`
      );

      // .m3u8 ファイルがすでに存在するか確認
      if (fs.existsSync(hlsFilePath)) {
        console.log(`HLSストリームはすでに存在します: ${hlsFilePath}`);
        return; // 既に作成されている場合はスルー
      }

      console.log(`HLSストリームを作成しています: ${video.filePath}`);

      // .m3u8ファイルが存在しない場合、HLSを作成
      const hlsStream = await createHlsStreamFromFilePath(video.filePath);
      console.log(`HLSストリームの作成が完了しました: ${hlsStream}`);
    } catch (error) {
      console.error(`動画 ${video.filePath} のHLS作成に失敗しました:`, error);
    }
  } catch (error) {
    console.error(
      `動画ID ${videoId} の情報取得時にエラーが発生しました:`,
      error
    );
  }
}
