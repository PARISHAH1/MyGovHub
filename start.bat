@echo off
echo Starting MyGovHub Server...
echo.
echo Checking if port 5000 is available...
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo Port 5000 is already in use!
    echo Please stop any existing server first.
    pause
    exit /b 1
)

echo Port 5000 is available.
echo.
echo Installing dependencies...
npm install

echo.
echo Starting server...
node server.js

pause 