import { Request, Response, NextFunction } from 'express';

/**
 * リクエストログを表示するミドルウェア
 */
export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // リクエストメソッドとURLをログに出力
  console.log(`${req.method} リクエスト ${req.url}`);
  next(); // 次のミドルウェアまたはルート処理へ進む
}
