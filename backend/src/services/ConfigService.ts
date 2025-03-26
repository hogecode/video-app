/**
 * config.iniファイルを読み書きするためのサービスファイル
 */

import * as fs from 'fs';
import * as ini from 'ini';

import { CONFIG_PATH } from '../constants';

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
        .split(/\r?\n/) // 改行で分割
        .map((folderPath: string) => folderPath.trim()) // 各パスの前後の空白を削除
        .filter(Boolean); // 空文字列を除外


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
 * config.iniファイルから hls_mode の値を取得し、trueかどうかを確認する関数
 * @returns {boolean} hls_mode が存在し、かつ true の場合は true、そうでない場合は false
 */
export function isHlsModeEnabled(): boolean {
  try {
    // config.iniファイルを読み込む
    const config = ini.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

    // 'settings' セクションが存在するか、かつ 'hls_mode' が 'true' であるか確認
    if (config.settings && config.settings.hls_mode === 'true') {
      return true; // hls_mode が true の場合
    }

    return false; // hls_mode が存在しないか、true でない場合
  } catch (error) {
    console.error('Failed to read config.ini', error);
    return false; // エラーが発生した場合は false を返す
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
    throw err; // エラーを再スロー
  }
}

