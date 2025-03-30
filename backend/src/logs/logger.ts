
import path from 'path';
import winston from 'winston';

// logsディレクトリを指定
const LOG_DIRECTORY = path.join(__dirname, 'logs');
const timestamp = new Date().toISOString().split('T')[0]; // 日付形式 (YYYY-MM-DD)

// winstonインスタンスの作成
const logger = winston.createLogger({
  level: 'info', // 'info'レベル以上のログを出力
  format: winston.format.combine(
    winston.format.colorize(), // ログに色をつける
    winston.format.timestamp(), // タイムスタンプを付与
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    // エラーログをファイルに出力
    new winston.transports.File({
      filename: path.join(LOG_DIRECTORY, `error-${timestamp}.log`), // ファイル名に日付を追加
      level: 'error',
    }),
  ],
});

export default logger;
