@echo off
setlocal EnableDelayedExpansion

:: =============================================================================
:: STOCK SOKO - UNIFIED STARTUP SCRIPT
:: =============================================================================
:: This script handles complete application startup:
:: - Dependency checks and installation
:: - Database initialization with sample data
:: - Backend server (FastAPI on port 8000)
:: - Frontend app (Expo on port 8081)
:: =============================================================================

title Stock Soko - Startup

echo.
echo ===============================================================================
echo                            STOCK SOKO STARTUP
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: CONFIGURATION
:: -----------------------------------------------------------------------------
set "PYTHON_CMD=python"
set "BACKEND_DIR=%~dp0backend"
set "FRONTEND_DIR=%~dp0frontend"
set "PROJECT_ROOT=%~dp0"

:: Check for Python in common locations
where python >nul 2>&1
if errorlevel 1 (
    if exist "C:\Users\USER\AppData\Local\Programs\Python\Python313\python.exe" (
        set "PYTHON_CMD=C:\Users\USER\AppData\Local\Programs\Python\Python313\python.exe"
    ) else if exist "C:\Python313\python.exe" (
        set "PYTHON_CMD=C:\Python313\python.exe"
    ) else if exist "C:\Python311\python.exe" (
        set "PYTHON_CMD=C:\Python311\python.exe"
    ) else (
        echo [ERROR] Python not found! Please install Python 3.11+ from python.org
        pause
        exit /b 1
    )
)

echo [INFO] Using Python: %PYTHON_CMD%
echo.

:: -----------------------------------------------------------------------------
:: 1. CHECK DEPENDENCIES
:: -----------------------------------------------------------------------------
echo [1/6] Checking dependencies...
echo.

:: Check Python packages
echo Checking Python packages...
%PYTHON_CMD% -c "import fastapi, uvicorn, sqlalchemy" 2>nul
if errorlevel 1 (
    echo [WARNING] Some Python packages missing. Installing...
    %PYTHON_CMD% -m pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] Failed to install Python packages
        pause
        exit /b 1
    )
    echo [OK] Python packages installed
) else (
    echo [OK] Python packages present
)

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install from nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found

:: Check frontend node_modules
if not exist "%FRONTEND_DIR%\node_modules" (
    echo [WARNING] Frontend dependencies missing. Installing...
    cd "%FRONTEND_DIR%"
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install frontend packages
        pause
        exit /b 1
    )
    cd "%PROJECT_ROOT%"
    echo [OK] Frontend packages installed
) else (
    echo [OK] Frontend packages present
)

echo.

:: -----------------------------------------------------------------------------
:: 2. CHECK PORTS
:: -----------------------------------------------------------------------------
echo [2/6] Checking ports...
echo.

:: Check if backend port 8000 is in use
netstat -ano | findstr ":8000" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [WARNING] Port 8000 already in use
    set /p KILL_8000="Kill process on port 8000? (y/n): "
    if /i "!KILL_8000!"=="y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        echo [OK] Port 8000 freed
        timeout /t 2 >nul
    ) else (
        echo [WARNING] Backend may fail to start
    )
) else (
    echo [OK] Port 8000 available
)

:: Check if frontend port 8081 is in use
netstat -ano | findstr ":8081" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Port 8081 in use (frontend may already be running)
) else (
    echo [OK] Port 8081 available
)

echo.

:: -----------------------------------------------------------------------------
:: 3. DATABASE SETUP
:: -----------------------------------------------------------------------------
echo [3/6] Setting up database...
echo.

:: Check if database exists
if not exist "%PROJECT_ROOT%stocksoko.db" (
    echo Database not found. Initializing...
    %PYTHON_CMD% manage.py init-db
    if errorlevel 1 (
        echo [ERROR] Failed to initialize database
        pause
        exit /b 1
    )
    echo [OK] Database initialized
) else (
    echo [OK] Database exists
)

:: Seed with sample data
echo Seeding sample data...
%PYTHON_CMD% seed_database.py >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Sample data may already exist
) else (
    echo [OK] Sample data seeded
)

echo.

:: -----------------------------------------------------------------------------
:: 4. START BACKEND
:: -----------------------------------------------------------------------------
echo [4/6] Starting backend server...
echo.

cd "%BACKEND_DIR%"
start "Stock Soko Backend" cmd /k "%PYTHON_CMD% -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
cd "%PROJECT_ROOT%"

:: Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 >nul

:: Health check with retry
echo Testing backend health...
set RETRY_COUNT=0
:health_check_loop
%PYTHON_CMD% -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health', timeout=2).read()" >nul 2>&1
if errorlevel 1 (
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! LSS 3 (
        timeout /t 2 >nul
        goto health_check_loop
    ) else (
        echo [WARNING] Backend may not be ready yet (this is normal)
    )
) else (
    echo [OK] Backend is running
)

echo.

:: -----------------------------------------------------------------------------
:: 5. START FRONTEND
:: -----------------------------------------------------------------------------
echo [5/6] Starting frontend app...
echo.

cd "%FRONTEND_DIR%"
start "Stock Soko Frontend" cmd /k "npx expo start"
cd "%PROJECT_ROOT%"

echo [OK] Frontend starting (in separate window)...
echo [INFO] Wait for QR code to appear in the new window
echo.

:: -----------------------------------------------------------------------------
:: 6. STARTUP COMPLETE
:: -----------------------------------------------------------------------------
echo ===============================================================================
echo                         STARTUP COMPLETE
echo ===============================================================================
echo.
echo ^> Access Points:
echo   - Backend API:     http://localhost:8000/api/v1/
echo   - API Docs:        http://localhost:8000/docs
echo   - Frontend:        Scan QR code in Expo window
echo.
echo ^> Mobile App Setup:
echo   1. Install Expo Go on your phone
echo   2. Scan QR code from Expo terminal window
echo   3. If connection fails, create frontend/.env.local:
echo      EXPO_PUBLIC_API_URL=http://YOUR_IP:8000
echo      (Find YOUR_IP with: ipconfig)
echo.
echo ^> Sample Data Available:
echo   - 20 NSE stocks (SCOM, KCB, EQTY, etc.)
echo   - 4 Learning Paths with 24 modules
echo   - Portfolio with sample holdings
echo   - AI recommendations
echo.
echo ^> Test Login:
echo   - Email:    test@example.com
echo   - Password: Test123!
echo.
echo ^> Commands:
echo   - View API docs:   http://localhost:8000/docs
echo   - Stop servers:    Close terminal windows
echo   - Reload app:      Shake phone or press 'r' in Expo terminal
echo.
echo ===============================================================================
echo.
echo [INFO] Both servers are running in separate windows
echo [INFO] Close this window or press any key to exit startup script
echo.

pause
exit /b 0

