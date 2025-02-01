-- ダミーデータ
-- なぜかユニーク制約エラーになる
INSERT
OR IGNORE INTO Video (
  fileName,
  folderPath,
  filePath,
  views,
  liked,
  createdAt,
  screenshotFilePath
)
VALUES
  (
    'hello.mp4',
    '/aaa',
    '/aaa/hello.mp4',
    100,
    1,
    '2024-11-27T00:00:00',
    '/screenshots/sample_video_screenshot.png'
  ),
  (
    'hello2.mp4',
    '/aaa',
    '/aaa/hello2.mp4',
    50,
    0,
    '2024-11-20T00:00:00',
    NULL
  );

INSERT
OR IGNORE INTO XMLCommentFile (
  commentCount,
  commentedDate,
  fileName,
  folderPath,
  filePath,
  createdAt
)
VALUES
  (
    10,
    '2012-11-27T00:00:00',
    'hello.xml',
    '/aaa',
    '/aaa/hello.xml',
    '2024-11-27T00:00:00'
  ),
  (
    5,
    '2016-11-26T00:00:00',
    'hello2.xml',
    '/aaa',
    '/aaa/hello2.xml',
    '2024-11-26T00:00:00'
  );