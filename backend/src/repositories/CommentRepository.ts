/**
 * XMLコメントファイル関連のリポジトリ
 * XMLファイルを追加、IDで取得、IDとファイルパスで削除する関数を作成
 * ToDo: この関数はアプリ起動時のXMLテーブル追加、削除時に呼び出す必要
 * ToDo: コメント数や時間などはコメントサービスを利用
 */

import { XMLCommentFile } from '@prisma/client';

import prisma from '../prisma';

/**
 * XMLCommentFileテーブルからすべてのレコードを取得する非同期関数
 * 
 * @returns すべてのXMLCommentFileのデータの配列
 */
export async function getAllXMLCommentFiles(): Promise<XMLCommentFile[]> {
  try {
    const xmlCommentFiles = await prisma.xMLCommentFile.findMany(); // すべてのレコードを取得
    return xmlCommentFiles;  // 取得したデータを返す
  } catch (error) {
    console.error('Error fetching all XMLCommentFiles:', error);
    throw new Error('Failed to fetch all XMLCommentFiles');
  }
}


/**
 * XMLCommentFileテーブルから指定されたIDのレコードを取得する非同期関数
 * Memo: 多分この関数は使わない
 * @param id - 取得するXMLCommentFileのID
 * @returns 指定されたIDのXMLCommentFileのデータ
 */
async function getXMLCommentFileById(id: number): Promise<XMLCommentFile | null> {  
  try {
    const xmlCommentFile = await prisma.xMLCommentFile.findUnique({
      where: {
        id: id,  // IDを使用してレコードを取得
      }
    });
    return xmlCommentFile;  // 見つかった場合はそのデータを返す
  } catch (error) {
    console.error('Error fetching XMLCommentFile by ID:', error);
    throw new Error('Failed to fetch XMLCommentFile by ID');
  }
}

/**
 * XMLCommentFileテーブルに新しいレコードを追加する非同期関数
 * 
 * @param data - Prismaの型に基づくデータ
 * @returns 作成したXMLCommentFileのデータ
 */
export async function addXMLCommentFile(
  data: Omit<XMLCommentFile, 'id' | 'createdAt'>  // Prismaの型を使用
): Promise<XMLCommentFile> {  // 戻り値の型はXMLCommentFile
  try {
    console.log(['CommentRepository.ts'],['addXMLCommentFile()'])

    const newXMLCommentFile = await prisma.xMLCommentFile.create({
      data: data,
    });
    return newXMLCommentFile;  // 作成されたレコードを返す
  } catch (error) {
    console.error('Error creating XMLCommentFile:', error);
    throw new Error('Failed to add XMLCommentFile');
  }
}


/**
 * XMLCommentFileテーブルから指定されたfilePathのレコードを削除する非同期関数
 * 
 * @param filePath - 削除するXMLCommentFileのfilePath
 * @returns 削除されたXMLCommentFileのデータ
 */
export async function deleteXMLCommentFileByFilePath(filePath: string): Promise<XMLCommentFile> {  
  try {
    const deletedXMLCommentFile = await prisma.xMLCommentFile.delete({
      where: {
        filePath: filePath,  // filePathを使用して削除
      }
    });
    return deletedXMLCommentFile;  // 削除されたレコードを返す
  } catch (error) {
    console.error('Error deleting XMLCommentFile by filePath:', error);
    throw new Error('Failed to delete XMLCommentFile by filePath');
  }
}


/**
 * XMLCommentFileテーブルから指定されたIDのレコードを削除する非同期関数
 * Memo: 多分この関数は使わない
 * @param id - 削除するXMLCommentFileのID
 * @returns 削除されたXMLCommentFileのデータ
 */
async function deleteXMLCommentFileById(id: number) {
  try {
    const deletedXMLCommentFile = await prisma.xMLCommentFile.delete({
      where: {
        id: id
      }
    });
    return deletedXMLCommentFile;
  } catch (error) {
    console.error('Error deleting XMLCommentFile:', error);
    throw new Error('Failed to delete XMLCommentFile');
  }
}