
@echo off
cd /d "%~dp0"
pm2 start .\backend\dist\app.js --name "video_app"
pause
