/**
 * 再生履歴テーブルのリポジトリ
 * 再生履歴をすべて取得する関数、追加する関数、すべて消去する関数
 */

import { WatchHistory } from '@prisma/client';

import prisma from '../prisma';

/**
 * WatchHistoryテーブルに新しい履歴を追加する非同期関数
 *
 * @param videoId - 観賞した動画のID
 * @returns 新しく追加したWatchHistoryのデータ
 */
export async function addWatchHistory(videoId: number): Promise<WatchHistory> {
  try {
    const newWatchHistory = await prisma.watchHistory.create({
      data: {
        videoId,  // 観賞した動画のID
        watchedAt: new Date(),  // 現在の日時を観賞日時に設定
      },
    });
    return newWatchHistory;  // 追加された履歴を返す
  } catch (error) {
    console.error('Error adding WatchHistory:', error);
    throw new Error('Failed to add WatchHistory');
  }
}


/**
 * WatchHistoryテーブルからすべての履歴を直近順に取得する非同期関数
 * 
 * @returns 直近順に並べたWatchHistoryのリスト
 */
export async function getAllWatchHistory(): Promise<WatchHistory[]> {
  try {
    const watchHistory = await prisma.watchHistory.findMany({
      orderBy: {
        watchedAt: 'desc',  // watchedAtで降順に並べ替え
      },
    });
    return watchHistory;  // 取得した履歴を返す
  } catch (error) {
    console.error('Error fetching WatchHistory:', error);
    throw new Error('Failed to fetch WatchHistory');
  }
}

/**
 * WatchHistoryテーブルからすべての履歴を削除する非同期関数
 * 
 * @returns 削除された履歴の数
 */
export async function deleteAllWatchHistory(): Promise<number> {
  try {
    const deleteResult = await prisma.watchHistory.deleteMany({});
    return deleteResult.count;  // 削除された履歴の件数を返す
  } catch (error) {
    console.error('Error deleting WatchHistory:', error);
    throw new Error('Failed to delete WatchHistory');
  }
}


/**
 * 指定されたIDのWatchHistoryレコードを削除する非同期関数
 * 
 * @param id - 削除するWatchHistoryのID
 * @returns 削除されたレコードの数
 */
export async function deleteWatchHistoryById(id: number): Promise<number> {
  try {
    const deleteResult = await prisma.watchHistory.delete({
      where: {
        id: id,  // 指定されたIDを基に削除
      },
    });
    return deleteResult ? 1 : 0;  // 削除された場合は1を返す
  } catch (error) {
    console.error('Error deleting WatchHistory by ID:', error);
    throw new Error('Failed to delete WatchHistory by ID');
  }
}
