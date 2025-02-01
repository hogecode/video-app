
//ToDo: エラーリトライなどもいずれ追加
//ToDo: いずれはaxiosに変更する

import { SERVER_URL } from "../constants";

/**
 * 通常の非同期fetch関数
 * JSONに対応、デフォルトURL指定
 * 
 * @param url - リクエストを送るAPIエンドポイントのURL
 * @param options - Fetchのオプション（メソッド、ヘッダーなど）
 * @returns レスポンスのデータ
 * 
 * @throws エラーハンドリング: レスポンスが正常でない場合、エラーを投げます
 */
async function UseFetch<T>(url: string, options: RequestInit = {}): Promise<T> {

  // リクエストURLを組み立て
  const requestUrl = `${SERVER_URL}${url}`;

  // Fetchオプションにデフォルトのヘッダーを追加
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  // カスタムオプションをマージ
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  // Fetchリクエストを送信
  const response = await fetch(requestUrl, mergedOptions);

  // レスポンスが正常でない場合はエラーを投げる
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  // JSONレスポンスを返す
  const data: T = await response.json();
  return data;
}

export default UseFetch;