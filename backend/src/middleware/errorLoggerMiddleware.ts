
import { Request, Response, NextFunction } from 'express';
import logger from '../logs/logger';
/**
 * console.errorをwinstonで上書きしてファイル出力するミドルウェア
 */
export function errorLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 元のconsole.errorを保持
  const originalConsoleError = console.error;

  // console.errorを上書き
  console.error = (...args: any[]) => {
    // argsを文字列に変換してwinstonで記録
    logger.error(
      args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
        .join(' ')
    );

    // 元のconsole.errorも呼び出す
    originalConsoleError.apply(console, args);
  };

  next();
}
