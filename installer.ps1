
# PM2をグローバルにインストール
npm install -g pm2

# backendディレクトリに移動
Set-Location -Path "backend"

# 必要なパッケージをインストール
npm install

# マイグレーションを実行
npm run migrate-dev

# TypeScriptをコンパイル
npx tsc


