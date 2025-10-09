@echo off
cd /d %~dp0
cd frontend
set EXPO_PUBLIC_API_URL=http://192.168.1.15:8000
echo Starting Stock Soko Frontend Server...
npx expo start --clear --reset-cache
