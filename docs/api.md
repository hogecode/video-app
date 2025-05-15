# API ドキュメント

- express は swaggerUI を自動生成しないのでこのファイルに簡単に書く
- できれば postman で API ドキュメントを生成

**GET /api/files**

- video と xml テーブルを統合して返却

```json
[
  {
    "id": 1,
    "fileName": "sample01.mp4",
    "folderPath": "C:\\Users\\shun1\\Downloads\\新しいフォルダー\\video_app\\backend\\assets\\sample_videos",
    "filePath": "C:\\Users\\shun1\\Downloads\\新しいフォルダー\\video_app\\backend\\assets\\sample_videos\\sample01.mp4",
    "views": 15,
    "liked": false,
    "createdAt": "2024-11-28T09:58:21.181Z",
    "screenshotFilePath": null,
    "commentCount": 6907,
    "commentedDate": "2023-01-05T15:00:00.000Z"
  }
]
```

**GET /api/files/:id**

```json
{
  "video": {
    "id": 1,
    "fileName": "sample01.mp4",
    "folderPath": "C:\\Users\\shun1\\Downloads\\新しいフォルダー\\video_app\\backend\\assets\\sample_videos",
    "filePath": "C:\\Users\\shun1\\Downloads\\新しいフォルダー\\video_app\\backend\\assets\\sample_videos\\sample01.mp4",
    "views": 16,
    "liked": false,
    "createdAt": "2024-11-28T09:58:21.181Z",
    "screenshotFilePath": null
  },
  "CommentJson": {
    "chats": [
      {
        "no": "11831",
        "vpos": "4",
        "date": "1672930800",
        "user_id": "PfURiQFVgertdvxUoRKbZ5zXA7E",
        "message": "ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!"
      },
      {
        "no": "11832",
        "vpos": "8",
        "date": "1672930800",
        "user_id": "kqLgVUjovA6g0-WOuGB19TAq3F8",
        "message": "ｈｊｍｔ"
      }
    ]
  }
}
```

**POST /api/files/refresh**

- フォルダ内の mp4, xml と DB の同期
- mp4 と xml をマージして返却

```json
[
  {
    "id": 1,
    "fileName": "sample01.mp4",
    "folderPath": "C:\\Users\\shun1\\Downloads\\新しいフォルダー\\video_app\\backend\\assets\\sample_videos",
    "filePath": "C:\\Users\\shun1\\Downloads\\新しいフォルダー\\video_app\\backend\\assets\\sample_videos\\sample01.mp4",
    "views": 15,
    "liked": false,
    "createdAt": "2024-11-28T09:58:21.181Z",
    "screenshotFilePath": null,
    "commentCount": 6907,
    "commentedDate": "2023-01-05T15:00:00.000Z"
  }
]
```

**GET /api/streams/:id**

- HLS モードで対応するm3u8ファイルが存在しない場合に生成するフォールバック

```json
{
    "message": "HLS stream created";
}
```
