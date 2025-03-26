
import { Request, Response, NextFunction } from 'express';
import etag from 'etag';

/**
 * レスポンスにETagを設定するミドルウェア
 * @param req - リクエストオブジェクト
 * @param res - レスポンスオブジェクト
 * @param next - 次のミドルウェアへの関数
 */
export function etagMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 元のsendメソッドを保持
  const originalSend = res.send;

  // sendメソッドをオーバーライド
  res.send = function (body: any): Response<any, Record<string, any>> {
    if (body) {
      // ETagを生成し、レスポンスヘッダーに設定
      res.setHeader('ETag', etag(JSON.stringify(body)));
    }
    // 元のsendメソッドを呼び出し、レスポンスを送信
    return originalSend.call(this, body);
  };

  next();
}
