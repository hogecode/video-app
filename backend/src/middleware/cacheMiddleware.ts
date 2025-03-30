import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// 10分の有効期限のキャッシュを設定
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // stdTTL: 600秒（10分）

/**
 * キャッシュを削除する関数
 * @param path: /api/filesのような形式
 * IPアドレスやホストは含まない
 */
export function clearCache(path: string): void {
  cache.del(path); // キャッシュを削除
  console.log(`キャッシュ削除: ${path}`);
}

/**
 * キャッシュを管理するミドルウェア
 * キャッシュが存在する場合は、それを返し、存在しない場合はレスポンスをキャッシュする
 */
export function cacheMiddleware(req: Request, res: Response, next: NextFunction): void {
  const cacheKey = req.originalUrl; // URLをキャッシュのキーとして使用

  // キャッシュが存在する場合はキャッシュされたデータを返す
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    res.json(cachedData); // キャッシュされたデータを返す
    return;
  }

  // キャッシュがない場合は、レスポンスの送信後にキャッシュする
  const originalSend = res.json;
  res.json = (body: any) => {
    // レスポンスが送信されたときにキャッシュを保存
    cache.set(cacheKey, body); // キャッシュにデータを保存
    return originalSend.call(res, body); // 元のsendメソッドを呼び出してレスポンスを返す
  };

  next(); // 次のミドルウェアへ
}
