/**
 * 主にセットアップ時にフォルダ情報とDBを同期するためのサービスファイル
 */
import * as fs from 'fs';
import * as path from 'path';

import { Video } from '@prisma/client';

import { COMMENT_DIR } from '../constants';
import {
    addXMLCommentFile, getAllXMLCommentFiles
} from '../repositories/CommentRepository';
import { addVideo, deleteVideoByFilePath, getAllVideos } from '../repositories/VideoRepository';
import {
    convertXmlToJsonAndSave, getCommentCount, getCommentTimestamp
} from './CommentFileService';
import { getFolderPaths } from './ConfigService';
import { getMp4FilesFromFolderAsync } from './FileReadService';
import {
    cleanupHlsFiles, takeScreenshot
} from './VideoService';

/**
 * XMLCommentFileの情報をVideoテーブルの値に追加する非同期関数
 * Refactor: APIのレスポンスを見やすくする
 * @returns VideoにcommentCountとcommentedDateを追加した配列
 */
export async function mergeVideosWithComments(): Promise<any[]> {
  try {
    // Videos と XMLCommentFiles をすべて取得
    const videos = await getAllVideos();
    const xmlCommentFiles = await getAllXMLCommentFiles();

    // Video オブジェクトとXMLFileオブジェクトを合成
    const mergedVideos = videos.map((video) => {
      // Video の filePath から拡張子を除いた部分を抽出
      const videoFilePathWithoutExtension = video.filePath.replace(/\.[^/.]+$/, '');

      // XMLCommentFile の中から一致する filePath を探す
      const matchedCommentFile = xmlCommentFiles.find((commentFile) => {
        const commentFilePathWithoutExtension = commentFile.filePath.replace(/\.[^/.]+$/, '');
        return commentFilePathWithoutExtension === videoFilePathWithoutExtension;
      });

      // 一致する場合は commentCount と commentedDate を追加
      if (matchedCommentFile) {
        return {
          ...video,
          commentCount: matchedCommentFile.commentCount,
          commentedDate: matchedCommentFile.commentedDate,
        };
      }

      // 一致しない場合はそのままの Video オブジェクトを返す
      return video;
    });

    return mergedVideos; // enrichされたVideoオブジェクトを返す
  } catch (error) {
    console.error('Error enriching videos with comments:', error);
    throw new Error('Failed to enrich videos with comments');
  }
}


//**ここから汎用ファイル関数を列挙**/
/**
 * mp4とxmlファイルのDBとの同期関数をまとめてエキスポート
 */
export async function syncVideosAndXMLCommentFilesWithDatabase() {
  try {
    // 並行してデータベースとの同期処理を実行
    await Promise.all([
      syncVideosWithDatabase(),  // syncVideosWithDatabase を非同期で実行
      syncXMLCommentFilesWithDatabase(),  // syncXMLCommentFilesWithDatabase を非同期で実行
    ]);

    console.log('syncVideosAndXMLCommentFilesWithDatabase()の処理が完了しました');
  } catch (error) {
    console.error('エラーが発生しました', error);
  }
}


/**
 * フォルダ内の動画ファイルをデータベースと比較し、追加・削除を反映する関数
 * config.iniでパスを取得 → DBとの差分 → 先ほど定義した関数でDBに追加、削除を反映してフォルダ内と一致させる
 * Memo: 多分この関数は結構重くなってしまう
 * ToDo: ここにXMLファイルをDBに更新する処理、スクショ処理も実装したいが面倒
 */
async function syncVideosWithDatabase(): Promise<void> {
  try {
    // iniに定義した監視するフォルダパスを取得
    const folderPaths = getFolderPaths();

    // データベースに存在する動画情報を取得
    const existingVideos = await getAllVideos();

    // データベースに存在するファイルパスをセットで取得
    const existingFilePaths = new Set(existingVideos.map(video => video.filePath));

    // フォルダごとに処理
    for (const folderPath of folderPaths) {
      try {
        // フォルダ内の.mp4ファイルの絶対パス一覧を取得
        const mp4Files = await getMp4FilesFromFolderAsync(folderPath);

        // フォルダ内のファイルがデータベースに存在しない場合は追加
        for (const filePath of mp4Files) {
          if (!existingFilePaths.has(filePath)) {
            try {
              let screenshotFilePath = null;
              // 新しい動画の場合はスクショを撮ってファイル名をデータベースに保存
              screenshotFilePath = await takeScreenshot(filePath);

              // 新しいファイルがあればデータベースに追加
              const newVideo = {
                fileName: path.basename(filePath),
                folderPath,
                filePath,
                views: 0,
                liked: false,
                screenshotFilePath
              };

              await addVideo(newVideo as Video);
              console.log(`Added new video: ${filePath}`);
            } catch (screenshotError) {
              console.error(`Failed to take screenshot for ${filePath}:`, screenshotError);
            }
          }
        }

      } catch (folderError) {
        console.error(`Error processing folder ${folderPath}:`, folderError);
      }
    }

    // フォルダ処理がすべて終了した後に動画削除処理を実行
    for (const video of existingVideos) {
      const folderPath = path.dirname(video.filePath); // ファイルが存在するフォルダパスを取得
      const mp4Files = await getMp4FilesFromFolderAsync(folderPath); // フォルダ内のmp4ファイル一覧を取得

      // フォルダ内に存在しない動画を削除
      if (!mp4Files.includes(video.filePath) || !folderPaths.includes(folderPath)) {
        try {
          // フォルダ内に存在しないファイルを削除
          await deleteVideoByFilePath(video.filePath);
          console.log(`Deleted video: ${video.filePath}`);

          // Refactor: 責務が違うけど面倒なのでここに書く
          await cleanupHlsFiles(video.fileName.replace(/\.[^/.]+$/, ''));

        } catch (deleteError) {
          console.error(`Failed to delete video ${video.filePath}:`, deleteError);
        }
      }
    }

    console.log(`syncVideosWithDatabase()の処理が完了しました`);

  } catch (error) {
    console.error('Error syncing videos with database:', error);
  }
}


/**
 * フォルダ内のXMLファイルとDBと同期する非同期関数
 * フォルダ内のXMLファイルがDBに無ければ追加し、フォルダ内に無ければDBから削除する
 * Refactor: for文のネストで可読性が悪い
 * @returns {Promise<void>}
 */
async function syncXMLCommentFilesWithDatabase(): Promise<void> {
  try {
    // getFolderPaths()で取得したすべてのフォルダパスを取得
    const folderPaths = getFolderPaths();

    // すべてのフォルダに対してDBとの同期処理を実行
    for (const folderPath of folderPaths) {
      console.log(`Processing folder: ${folderPath}`);

      // フォルダ内のすべてのXMLファイルを取得
      const files = fs.readdirSync(folderPath);
      const xmlFiles = files.filter(file => file.endsWith('.xml'));

      // フォルダ内にXMLファイルが存在しない場合
      if (xmlFiles.length === 0) {
        console.log(`指定されたフォルダにはXMLファイルがありません: ${folderPath}`);
        continue; // 次のフォルダに進む
      }

      // データベース内のすべてのXMLCommentFileを取得
      const existingXMLCommentFilesInDB = await getAllXMLCommentFiles();

      // フォルダ内のXMLファイルとDBのXMLCommentFileを比較
      for (const xmlFile of xmlFiles) {
        const filePath = path.join(folderPath, xmlFile);
        const existingFile = existingXMLCommentFilesInDB.find((file) => file.filePath === filePath);

        // コメント数と最初のコメントの時刻を取得
        const commentCount = await getCommentCount(filePath);
        const commentedDate = await getCommentTimestamp(filePath);

        // フォルダ内にあってDBにない場合は新規に追加
        if (!existingFile) {
          const newCommentFile = {
            fileName: xmlFile,
            folderPath,
            filePath,
            commentCount,
            commentedDate
          };

          await addXMLCommentFile(newCommentFile);
          console.log(`新規ファイルがDBに追加されました: ${xmlFile}`);

        }
      }

      // データベース内に存在し、フォルダ内に存在しないファイルを削除
      /*
      for (const dbFile of existingXMLCommentFilesInDB) {
        const filePath = dbFile.filePath;
        if (!xmlFiles.some((file) => path.join(folderPath, file) === filePath)) {
          await deleteXMLCommentFileByFilePath(filePath);
          console.log(`フォルダ内に存在しないファイルが削除されました: ${filePath}`);
        }
      }
      */
    }
    console.log('syncXMLCommentFilesWithDatabaseの処理は完了しました');
  } catch (error) {
    console.error('Error syncing XMLCommentFiles with database:', error);
    throw new Error('Failed to sync XMLCommentFiles with database');
  }
}



/**
 * フォルダ内のXMLファイルとJSONを同期し、DBに必要な情報を追加する関数
 * @returns {Promise<void>}
 */
export async function syncXMLWithJson(): Promise<void> {
  try {
    // getFolderPaths()で取得したすべてのフォルダパスを取得
    const folderPaths = getFolderPaths();

    // すべてのフォルダに対して同期処理を実行
    for (const folderPath of folderPaths) {

      // フォルダ内のすべてのXMLファイルを取得
      const files = fs.readdirSync(folderPath);
      const xmlFiles = files.filter(file => file.endsWith('.xml'));

      // フォルダ内にXMLファイルが存在しない場合
      if (xmlFiles.length === 0) {
        continue; // 次のフォルダに進む
      }

      // フォルダ内のXMLファイルについて、すでにJSONが存在するか確認
      for (const xmlFile of xmlFiles) {
        // path.basenameは拡張子を取り除く、ここではaaa.xml -> aaa.jsonに変換
        const jsonFilePath = path.join(COMMENT_DIR, path.basename(xmlFile, '.xml') + '.json');

        // JSONファイルがすでに存在する場合はスキップ
        if (fs.existsSync(jsonFilePath)) {
          continue; // JSONが存在するので次のファイルへ
        }

        // XMLファイルに対応するJSONが存在しない場合、XMLをJSONに変換して保存
        const xmlFilePath = path.join(folderPath, xmlFile);
        // console.log(`XMLファイルからJSONを生成します: ${xmlFilePath}`);

        // XMLをJSONに変換して保存する関数を呼び出す
        await convertXmlToJsonAndSave(xmlFilePath);
        console.log(`JSONファイルが保存されました: ${jsonFilePath}`);
      }
    }

    console.log('syncXMLWithJson()の処理は完了しました');
  } catch (error) {
    console.error('Error syncing XML with JSON', error);
    throw new Error('Failed to sync XML with JSON');
  }
}

