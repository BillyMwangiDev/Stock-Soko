@echo off
echo Starting Stock Soko Frontend (Expo)...
cd frontend
set EXPO_PUBLIC_API_URL=http://192.168.1.15:8000
npx expo start --clear --reset-cache
