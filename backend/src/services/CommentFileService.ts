// XMLファイル関連の処理を各ファイル

import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

import { COMMENT_DIR } from '../constants';

/**
 * XMLファイル内の`chat`フィールドの数を取得する関数
 * @param filePath XMLファイルのパス
 * @returns {Promise<number>} chatフィールドの数
 */
export async function getCommentCount(filePath: string): Promise<number> {
  try {
    // XMLファイルを読み込んでパースする
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    const parsedData = await parseStringPromise(xmlData);

    // `chat`フィールドの数を返す
    const chatCount = parsedData.packet.chat ? parsedData.packet.chat.length : 0;
    return chatCount;
  } catch (error) {
    console.error('Error parsing XML file:', error);
    throw new Error('Failed to parse XML file');
  }
}


/**
 * XMLファイルのchat要素を基にコメントのタイムスタンプを取得する関数
 * @param {string} filePath XMLファイルのパス
 * @returns {Promise<Date>} タイムスタンプ（Dateオブジェクト）を返す
 */
export async function getCommentTimestamp(filePath: string): Promise<Date> {
  try {
    // XMLファイルを同期的に読み込む
    const xmlData = fs.readFileSync(filePath, 'utf-8');
    // console.log('XMLファイル', filePath, 'を読み込みました');
    // XMLをJavaScriptオブジェクトに変換
    const parsedData = await parseStringPromise(xmlData);

    // chat要素をすべて取得
    const chats = parsedData.packet.chat;
    // console.log('コメント数は', chats.length, 'です');

    if (!chats || chats.length === 0) {
      throw new Error('No chat elements found in the XML');
    }

    // 最も早いdateを持つchatを探す
    // Memo: コメントは_、dateは$で取得することに注意
    let earliestDateChat = chats[0];
    // console.log('最初のコメントは', earliestDateChat, 'です');
    // console.log('最初のコメントのdateは', earliestDateChat.$.date, 'です');

    for (const chat of chats) {
      if (chat.$.date && chat.$.date < earliestDateChat.$.date) {
        earliestDateChat = chat;
      }
    }
    // console.log('最も早いコメントは', earliestDateChat.$.date, 'です');

    if (!earliestDateChat.$.date || earliestDateChat.$.date.length === 0) {
      throw new Error('Missing date in the chat element');
    }

    // 最も早いdateの値を取得
    const date = earliestDateChat.$.date; // 秒単位のdate

    // タイムスタンプ（ミリ秒単位）を計算
    const timestamp = new Date(parseInt(date) * 1000); // Dateオブジェクトを作成（ミリ秒単位）
    // console.log('そのコメントのタイムスタンプは', timestamp, 'です');
    
    return timestamp;
  } catch (error) {
    console.error('Error processing XML file:', error);
    throw new Error('Failed to parse XML file');
  }
}


/**
 * XMLファイルをJSON形式に変換する関数
 * Refactor: 重いのでできればファイル追加時に実行するようにしたい
 * @param {string} filePath XMLファイルのパス
 * @returns {Promise<any>} JSONオブジェクトを返す
 */
export async function convertXmlToJson(filePath: string): Promise<any> {
  try {
    // XMLファイルを非同期的に読み込む
    const xmlData = await fs.promises.readFile(filePath, 'utf-8');
    console.log('XMLファイル', filePath, 'を読み込みました');

    // BOM（Byte Order Mark）を削除し、前後の空白を削除
    const cleanedXmlData = xmlData
        .replace(/^\uFEFF/, '')
        .trim();

    // XMLをJavaScriptオブジェクトに変換
    const parsedData = await parseStringPromise(xmlData);
    console.log('XMLをJSONに変換しました');

    // chatフィールドの内容を取り出し
    const chats = parsedData.packet.chat.map((chat: any) => ({
      // thread: chat.$.thread,
      no: chat.$.no,
      vpos: chat.$.vpos,
      date: chat.$.date,
      // date_usec: chat.$.date_usec,
      // mail: chat.$.mail,
      user_id: chat.$.user_id,
      // premium: chat.$.premium,
      // anonymity: chat.$.anonymity,
      message: chat._, // chatメッセージの内容
    }));
    console.log('convertXmlToJson()の処理を終了しました');

    return {
      chats
    };
  } catch (error) {
    console.error('Error processing XML file:', error);
    throw new Error('Failed to parse XML file');
  }
}


/**
 * XMLファイルをJSON形式に変換し、指定のディレクトリに保存する関数
 * @param {string} filePath XMLファイルのパス
 * @returns {Promise<void>}
 */
export async function convertXmlToJsonAndSave(filePath: string): Promise<void> {
  try {
    // XMLファイルを非同期的に読み込む
    const xmlData = await fs.promises.readFile(filePath, 'utf-8');
    console.log('XMLファイル', filePath, 'を読み込みました');

    // BOM（Byte Order Mark）を削除し、前後の空白を削除
    const cleanedXmlData = xmlData.replace(/^\uFEFF/, '').trim();

    // XMLをJavaScriptオブジェクトに変換
    const parsedData = await parseStringPromise(cleanedXmlData);
    console.log('XMLをJSONに変換しました');

    // chatフィールドの内容を取り出し
    const chats = parsedData.packet.chat.map((chat: any) => ({
      no: chat.$.no,
      vpos: chat.$.vpos,
      date: chat.$.date,
      user_id: chat.$.user_id,
      message: chat._, // chatメッセージの内容
    }));

    const jsonData = { chats };

    // ファイル名を作成（拡張子なし）
    // 拡張子を取り除いてJSONファイル名を作成
    const fileName = path.basename(filePath, path.extname(filePath)) + '.json';
    const outputFilePath = path.join(COMMENT_DIR, fileName);

    // JSONファイルとして保存
    await fs.promises.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf-8');
    console.log(`JSONファイルを保存しました: ${outputFilePath}`);
  } catch (error) {
    console.error('Error processing XML file:', error);
    throw new Error('Failed to convert XML to JSON and save the file');
  }
}

/**
 * 指定のJSONファイルを読み込み、その内容を返す関数
 * @param {string} fileName JSONファイル名
 * @returns {Promise<any>} JSONオブジェクト
 */
export async function readCommentJsonFile(JsonfilePath: string): Promise<any> {
  try {
    const jsonData = await fs.promises.readFile(JsonfilePath, 'utf-8');
    console.log('JSONファイルを読み込みました:', JsonfilePath);

    return JSON.parse(jsonData); // JSONをオブジェクトとして返す
  } catch (error) {
    console.error('Error reading JSON file:', error);
    throw new Error('Failed to read JSON file');
  }
}