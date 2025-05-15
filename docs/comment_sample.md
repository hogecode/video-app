# XMLコメントファイルの仕様メモ

### vposの仕様

**1vpos = 0.01秒**

例:
- vpos=1000なら10秒
- vpos=96000なら960秒=16分

**要するにコメントファイルのvposの最大値を6000で割れば動画の再生時間をコメントファイルから計算できる**

### XMLコメントファイルのフィールド

複数のXMLコメントファイルの形式で共通している

- no 
- vpos 
- date 
- date_usec(動画では0) 
- user_id 
- message(JSON仕様)

フィールドのみにバックエンドで整形する

**xmlの形式**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<packet>
  <chat thread="M.lKkCCgfaifjEznH-JzUTXw" no="11831" vpos="4" date="1672930800" date_usec="39384" mail="184" user_id="PfURiQFVgertdvxUoRKbZ5zXA7E" premium="1" anonymity="1">ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!</chat>
```

**上記に対応するJSONの形式**

```json
{
  "chats": [
    {
      "thread": "M.lKkCCgfaifjEznH-JzUTXw",
      "no": "11831",
      "vpos": "4",
      "date": "1672930800",
      "date_usec": "39384",
      "mail": "184",
      "user_id": "PfURiQFVgertdvxUoRKbZ5zXA7E",
      "premium": "1",
      "anonymity": "1",
      "message": "ｷﾀ━━━━(ﾟ∀ﾟ)━━━━!!"
    },
```