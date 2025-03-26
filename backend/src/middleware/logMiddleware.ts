
import { Request, Response, NextFunction } from 'express';
import logger from '../logs/logger';

/**
 * console.logとconsole.errorをwinstonで上書きしてログをファイル出力するミドルウェア
 */
export function logMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 元のconsole.logとconsole.errorを保持
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  // console.logを上書き
  console.log = (...args: any[]) => {
    // argsを文字列に変換してwinstonで記録
    logger.info(
      args
        .map((arg) => (typeof arg === 'object' ? JSON.stringify(arg) : arg))
        .join(' ')
    );

    // 元のconsole.logも呼び出す
    originalConsoleLog.apply(console, args);
  };

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

  // 次のミドルウェアまたはルートハンドラへ処理を渡す
  next();
}
