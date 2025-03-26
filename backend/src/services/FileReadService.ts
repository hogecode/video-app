/**
 * フォルダ内のmp4やxmlファイルの情報を取得するためのサービスファイル
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * 指定されたフォルダ内の全てのXMLファイルのパスを非同期で取得する関数
 * @param folderPath フォルダのパス
 * @returns {Promise<string[]>} フォルダ内のXMLファイルのパスの配列
 */
export async function getXmlFilesFromFolder(folderPath: string): Promise<string[]> {
  try {
    // フォルダ内のファイルを非同期で読み込み
    const files = await fs.promises.readdir(folderPath);

    // .xmlファイルのパスをフィルタリングして配列で返す
    const xmlFiles = files
      .filter(file => file.endsWith('.xml')) // 拡張子が.xmlのファイルをフィルタリング
      .map(file => path.join(folderPath, file)); // フルパスを作成
    return xmlFiles;
  } catch (err) {
    console.error('フォルダ内のXMLファイルの取得中にエラーが発生しました:', err);
    return []; // エラーが発生した場合は空の配列を返す
  }
}


/**
 * 非同期で指定されたフォルダ内の全ての.mp4ファイルのパスを取得する関数
 * @param folderPath フォルダのパス
 * @returns {Promise<string[]>} フォルダ内の.mp4ファイルの絶対パスの配列
 */
export async function getMp4FilesFromFolderAsync(folderPath: string): Promise<string[]> {
  // フォルダ内のファイルを非同期で取得
  const files = await fs.promises.readdir(folderPath);

  // .mp4ファイルのパスをフィルタリングして配列で返す
  const mp4Files = files
    .filter(file => file.endsWith('.mp4')) // 拡張子が.mp4のファイルをフィルタリング
    .map(file => path.join(folderPath, file)); // フルパスを生成
  console.log('getMp4FilesFromFolderAsync()の処理が完了しました');
  return mp4Files;
}

