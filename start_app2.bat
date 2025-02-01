
@echo off

:: フロントエンドのディレクトリに移動
cd /d "%~dp0\frontend"

:: バックグラウンドで npm start を実行
start npm start

pause