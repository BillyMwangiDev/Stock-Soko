@echo off
echo ========================================
echo Starting Stock Soko Frontend Server
echo Port: 8081
echo ========================================
echo.

cd /d "%~dp0\frontend"
npx expo start

pause

