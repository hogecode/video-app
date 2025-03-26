
import { Video } from '@prisma/client';

import prisma from '../prisma';

/**
 * Videoテーブルの全レコードを取得する関数
 *
 * @returns {Promise<Video[]>} - 取得した動画のデータの配列
 * @throws {Error} - データ取得に失敗した場合にエラーを投げる
 */
export async function getAllVideos(): Promise<Video[]> {
  try {
    const videos = await prisma.video.findMany();
    return videos; // 取得した動画のデータを返す

  } catch (error) {
    console.error('Error fetching videos:', error);
    throw new Error('Failed to fetch videos');
  }
}

/**
 * 特定のVideoをIDで取得する関数
 *
 * @param {number} id - 取得したい動画のID
 * @returns {Promise<Video | null>} - 指定したIDの動画データ。見つからなかった場合はnull。
 * @throws {Error} - データ取得に失敗した場合にエラーを投げる
 */
export async function getVideoById(id: number): Promise<Video | null> {
  try {
    const video = await prisma.video.findUnique({
      where: {
        id: id,
      },
    });
    return video; // 指定したIDの動画を返す
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    throw new Error('Failed to fetch video by ID');
  }
}


/**
 * 新しいVideoを追加する関数
 * Memo: パス関連の処理は呼び出しもとで実行
 * @param {Video} video - 動画の情報（fileName, folderPath, filePath など）
 * @returns {Promise<Video>} - 追加した動画のデータ
 * @throws {Error} - データ追加に失敗した場合にエラーを投げる
 */
export async function addVideo(video: Video): Promise<Video> {
  try {
    const newVideo = await prisma.video.create({
      data: {
        fileName: video.fileName,
        folderPath: video.folderPath,
        filePath: video.filePath,
        views: 0, 
        liked: false, 
        screenshotFilePath: video.screenshotFilePath,
      },
    });
    return newVideo; // 追加した動画のデータを返す
  } catch (error) {
    console.error('Error adding video:', error);
    throw new Error('Failed to add video');
  }
}


/**
 * VideoをfilePathで削除する関数
 *
 * @param {string} filePath - 削除したい動画のファイルパス
 * @returns {Promise<Video>} - 削除された動画のデータ
 * @throws {Error} - データ削除に失敗した場合にエラーを投げる
 */
export async function deleteVideoByFilePath(filePath: string): Promise<Video> {
  try {
    const deletedVideo = await prisma.video.delete({
      //Memo: ユニークキーをつけていないとエラーになる
      where: {
        filePath: filePath, // filePathを使って削除
      },
    });
    return deletedVideo; // 削除した動画のデータを返す
  } catch (error) {
    console.error('Error deleting video:', error);
    throw new Error('Failed to delete video');
  }
}


/**
 * 動画のviewsをインクリメントする関数
 * @param videoID インクリメントしたい動画のID
 * @returns 更新された動画データ
 * @throws エラーが発生した場合に投げられる
 */
export async function incrementVideoViews(videoID: number): Promise<Video> {
  try {
    // 動画のviewsカウントを1増やす
    const updatedVideo = await prisma.video.update({
      where: { id: videoID }, // 動画IDで指定
      data: {
        views: {
          increment: 1, // viewsを1増やす
        },
      },
    });

    return updatedVideo; // 更新された動画データを返す
  } catch (error) {
    console.error('Error updating views:', error);
    throw new Error('Failed to increment views');
  }
}