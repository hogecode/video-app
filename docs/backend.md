# TODOリスト

- [ ] アプリ初期化時

  - [x] exe で受け取った引数を config.ini に書く処理を追加
  - [ ] スクリプトとバイナリでインストーラの動作確認

- [ ] アプリ起動時

  - [x] getFolders で ini からパスを取得
  - [x] mp4 ファイルの更新があった場合に DB に反映
  - [x] サムネの ファイル名 も追加
  - [x] XML ファイルの更新があった場合に DB に反映
  - [x] コメント数や日時を取得して DB に追加
  - [x] getMp4Files getXMLFiles で動画と xml パスを取得
  - [x] DB-file なら DB から削除、file-DB なら DB に追加

- [ ] エンドポイント

  - [x] GET /api/files (video と xml テーブルを統合)
  - [x] GET /api/files/:id (HLS 初期化、JSON 返却、再生回数、再生履歴追加)
  - [x] POST /api/files/refresh (フォルダと DB を同期、動画ファイル返却)

  - [x] GET /api/history (再生履歴を動画、コメントテーブルとマージして返却)
  - [x] DELETE /api/history (再生履歴を削除)
  - [x] DELETE /api/history/:id (再生履歴を削除)

