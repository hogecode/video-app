import path from 'path';

export const STATIC_DIR = path.join(__dirname, '..','..','assets'); 
export const SCREENSHOT_DIR = path.join(STATIC_DIR, 'screenshots');
export const COMMENT_DIR = path.resolve(STATIC_DIR, 'comments');
export const STREAM_DIR = path.join(STATIC_DIR, 'stream');
export const BUILT_HTML_DIR = path.join(__dirname, '..','..','..','/frontend', 'build');
export const CONFIG_PATH = path.resolve(__dirname, '../../../config.ini');
export const CERT_DIR = path.join(__dirname, '..', 'cert');