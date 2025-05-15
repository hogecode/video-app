# このアプリの仕様

簡単に動作フローやフォルダ構造について書きます。開発記事に関しては[こちら](https://hoge-code.github.io/md/posts/2025-02-21-video-app)も参照ください。

### 起動直後の流れ

```mermaid
flowchart TD
    A[config.iniからフォルダのパスの配列を取得] --> B{フォルダのパス/ファイルの状態変更}
    B -->|フォルダのパスが設定ファイルから消えた or ファイルが削除された| C[sqliteから動画情報を削除]
    B -->|フォルダのパスが追加 or ファイルが追加| D[sqliteに動画情報を追加]
    D --> E[コメントをxmlからJSONに変換]
    E --> F[サムネ生成]
    
    class A,B,C,D,E,F default;
```

**HLSモードの場合**

HLSモードの場合は以下のフローが追加されます。
```mermaid
flowchart TD
     I{フォルダのパス/ファイルの状態変更}
    I -->|フォルダのパスが消えた or ファイルが削除された| J[動画のhls/tsファイルを削除]
    J --> K[フォールバックとしてフロントから動画APIを叩いた時にHLSを生成]
    I -->|フォルダのパスが追加 or ファイルが追加| L[動画のhls/tsファイルを生成]
    
    class I,J,K,L default;
```

### バックエンドの構造

```plaintext
|--assets
|  |--screenshots # サムネ生成後の保存先
|  |--stream # HLSファイルの保存先
|--src
|  |--constants # フォルダパスの定数
|  |--installer # 対話型インストーラ
|  |--logs # カスタムロガーとログファイルの保存先
|  |--middleware # カスタムミドルウェア
|  |--prisma # ORM
|  |--repositories # prismaのクエリ
|  |--routers # ルーター
|  |--services # サービスファイル
|  |--utils # ユーティリティ関数
```

### フロントの構造

```plaintext
|--public # PWA用のファイル
|  |--assets # PWA用の様々な大きさの画像
|--src
|  |--assets 
|  |--components # 再利用用のコンポーネント
|  |--context # 永続化用のuseContext
|  |--hooks # カスタムフック
|  |--pages # ページ(テンプレートを利用)
|  |--styles # フォントインストール用のcss
|  |--types # 全体で利用する型
|  |--utils # ユーティリティ関数
```


