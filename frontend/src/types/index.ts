
// Videoの型定義
export interface Video {
  id: number;
  fileName: string;
  folderPath: string;
  filePath: string;
  views: number;
  liked: boolean;
  createdAt: string;
  screenshotFilePath: string | null;
  commentCount: number | null;
  commentedDate: string | null;
}

export interface Comment {
  no: string;
  vpos: number; // コメントの表示位置（秒）
  date: string;
  message: string;
}
