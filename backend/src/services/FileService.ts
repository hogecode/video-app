//Refactor: 肥大化しそうなのでutilsフォルダに汎用関数は移動する

import * as fs from 'fs';
import * as ini from 'ini';
import * as path from 'path';

import { Video, XMLCommentFile } from '@prisma/client';

import { COMMENT_DIR, CONFIG_PATH } from '../constants';
import {
    addXMLCommentFile, deleteXMLCommentFileByFilePath, getAllXMLCommentFiles
} from '../repositories/CommentRepository';
import { addVideo, deleteVideoByFilePath, getAllVideos } from '../repositories/VideoRepository';
import {
    convertXmlToJsonAndSave, getCommentCount, getCommentTimestamp
} from './CommentFileService';
import {
    cleanupHlsFiles, createHlsForVideos, createHlsStream, takeScreenshot
} from './VideoService';

/**
 * XMLCommentFileの情報をVideoテーブルの値に追加する非同期関数
 * Refactor: APIのレスポンスを見やすくする
 * @returns VideoにcommentCountとcommentedDateを追加した配列
 */
export async function mergeVideosWithComments(): Promise<any[]> {
  try {
    console.log(['FileService.ts'],['mergeVideosWithComments()']);
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

        // Fix: フォルダになくてもDBから削除されない
        // データベースに存在するがフォルダ内にないファイルを削除
        for (const video of existingVideos) {
          // DBのフォルダパスがフォルダのパスと一致し、フォルダ内にファイルが存在しない場合
          if (!mp4Files.includes(video.filePath)) {
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
          console.log(`syncVideosWithDatabase()の処理が完了しました`);
        }

      } catch (folderError) {
        console.error(`Error processing folder ${folderPath}:`, folderError);
      }
    }

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
      for (const dbFile of existingXMLCommentFilesInDB) {
        const filePath = dbFile.filePath;
        if (!xmlFiles.some((file) => path.join(folderPath, file) === filePath)) {
          await deleteXMLCommentFileByFilePath(filePath);
          console.log(`フォルダ内に存在しないファイルが削除されました: ${filePath}`);
        }
      }
    }
    console.log('syncXMLCommentFilesWithDatabase()の処理が完了しました');
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


/**
 * config.iniファイルからフォルダパスを取得する関数
 * Refactor: tryを使う
 * @returns {string[]} フォルダパスの配列
 */
export function getFolderPaths(): string[] {

  // config.iniファイルを読み込む
  const config = ini.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  // console.log('configファイルのパスは', CONFIG_PATH);

  // 'paths' で始まるキー名を取得して、それぞれの値を処理
  const folderPaths: string[] = [];

  // 'paths'で始まるキーをフィルタリングして処理
  for (const key in config.folders) {
    if (key.startsWith('paths')) {
      const paths = config.folders[key];
      
      // 改行で分割し、不要な空白を削除
      const pathsArray = paths
        .split(/\r?\n/)  // 改行で分割
        .map((folderPath: string) => folderPath.trim())  // 各パスの前後の空白を削除
        .filter(Boolean);  // 空文字列を除外

      // folderPathsに追加
      folderPaths.push(...pathsArray);
    }
  }
  // Memo: 何度も呼ばれるのでコメントアウト
  //console.log('動画のフォルダのパスは', folderPaths);
  //console.log('getFolderPaths()の処理が完了しました');

  return folderPaths;
}



/**
 * 非同期で指定されたフォルダ内の全ての.mp4ファイルのパスを取得する関数
 * @param folderPath フォルダのパス
 * @returns {Promise<string[]>} フォルダ内の.mp4ファイルの絶対パスの配列
 */
async function getMp4FilesFromFolderAsync(folderPath: string): Promise<string[]> {
  // フォルダ内のファイルを非同期で取得
  const files = await fs.promises.readdir(folderPath);

  // .mp4ファイルのパスをフィルタリングして配列で返す
  const mp4Files = files
    .filter(file => file.endsWith('.mp4'))  // 拡張子が.mp4のファイルをフィルタリング
    .map(file => path.join(folderPath, file));  // フルパスを生成
  console.log('getMp4FilesFromFolderAsync()の処理が完了しました');
  return mp4Files;
}


/**
 * 指定されたフォルダ内の全てのXMLファイルのパスを非同期で取得する関数
 * @param folderPath フォルダのパス
 * @returns {Promise<string[]>} フォルダ内のXMLファイルのパスの配列
 */
async function getXmlFilesFromFolder(folderPath: string): Promise<string[]> {
  try {
    // フォルダ内のファイルを非同期で読み込み
    const files = await fs.promises.readdir(folderPath);

    // .xmlファイルのパスをフィルタリングして配列で返す
    const xmlFiles = files
      .filter(file => file.endsWith('.xml'))  // 拡張子が.xmlのファイルをフィルタリング
      .map(file => path.join(folderPath, file));  // フルパスを作成
    return xmlFiles;
  } catch (err) {
    console.error('フォルダ内のXMLファイルの取得中にエラーが発生しました:', err);
    return []; // エラーが発生した場合は空の配列を返す
  }
}


/**
 * 複数の文字列配列を引数に取り、それらの文字列をconfig.iniの[folders]セクションのpathsに書き込む非同期関数
 * アプリ初期化時にexeから使う用途
 * Memo: 多分移動したほうがいい
 * @param folderPaths 複数の文字列配列（各配列にはフォルダパスが含まれる）
 * @returns {Promise<void>} 書き込みが完了するまでの非同期処理
 */
export async function writeFolderPathsToConfig(...folderPaths: string[]): Promise<void> {
  try {
    // 現在のconfig.iniファイルを非同期で読み込む
    const configFileContent = await fs.promises.readFile(CONFIG_PATH, 'utf-8');

    // 既存の設定をパース
    const config = ini.parse(configFileContent);

    // pathsに新しいフォルダパスを追加
    config.folders = config.folders || {}; // foldersセクションがない場合は作成
    config.folders.paths = folderPaths.join(','); // 複数のフォルダパスをカンマ区切りの文字列として格納

    // 新しい内容をconfig.iniファイルに書き込む
    await fs.promises.writeFile(CONFIG_PATH, ini.stringify(config));

    console.log('config.iniが更新されました');
  } catch (err) {
    console.error('config.iniの書き込み中にエラーが発生しました:', err);
    throw err;  // エラーを再スロー
  }
}





