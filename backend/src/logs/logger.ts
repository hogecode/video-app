
// src/logs/logger.ts

import path from 'path';
import winston from 'winston';

// logsディレクトリを指定
const LOG_DIRECTORY = path.join(__dirname, 'logs');
const timestamp = new Date().toISOString().split('T')[0]; // 日付形式 (YYYY-MM-DD)

// winstonインスタンスの作成
const logger = winston.createLogger({
  level: 'error', // 'error'レベル以上のログを出力
  transports: [
    // コンソールにログを出力
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // エラーログをファイルに出力
    new winston.transports.File({
      filename: path.join(LOG_DIRECTORY, `error-${timestamp}.log`), // ファイル名に日付を追加
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});

export default logger;
