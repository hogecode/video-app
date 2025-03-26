@echo on
chcp 65001

:: アプリケーションが起動している場合停止する
pm2 list | findstr /C:"video_app" > nul
if %errorlevel%==0 (
    echo video_appが存在している場合は停止します...
    pm2 stop video_app
) 

:: dev.dbファイルを削除する
del .\backend\src\prisma\dev.db

:: backendディレクトリに移動
cd backend

:: マイグレーションを実行する
npm run migrate-dev

:: PM2を再起動する
pm2 start video_app

:: 完了メッセージ
echo 処理が完了しました。
pause

