# Memo: 動作確認はまだ出来ていない

# ベースイメージとして Node.js を指定
FROM node:16

# 作業ディレクトリを作成
WORKDIR src/app

# アプリケーションの依存関係をコピー
# package.json と package-lock.json をコピー
COPY package*.json ./

# アプリケーションの依存関係をインストール
RUN npm install --production

# ソースコードをコンテナ内にコピー
COPY . .

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]