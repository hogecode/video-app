### sqliteコマンド

忘備録。コマンドはprismaフォルダで実行するように注意。DB仕様はprismaのスキーマファイルから参照できます。

```bash
# DB起動 
sqlite3 dev.db

# テーブル一覧
.tables

# SQLファイルを読み込む
.read db.sql
```