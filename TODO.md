### 環境関連

- [ ] ログが出力されない問題(npx ts-node)
- [ ] デバッグ構成
- [ ] API のレスポンスを見やすくする
- [ ] パフォーマンス向上させる

//動作確認
・アプリ初期化時の同期

- [ ] 直接 node と pkg でテスト

・アプリ起動時の同期

- [x] フォルダ内の mp4, xml と DB の同期
- [x] ffmpeg でスクショパスを取得

・GET /api/files

- [x] video と xml テーブルを統合して返却

・GET /api/files/:id

- [x] JSON 返却、再生回数、再生履歴追加

・POST /api/files/refresh

- [x] フォルダ内の mp4, xml と DB の同期
- [x] mp4 と xml をマージして返却

・GET /api/streams/:id

- [x] HLS 初期化

//フロントエンド

- [ ] スナックバー機能

//不具合

- [ ] エンコードオプションと並列処理を実装
- [ ] インストーラ作成
