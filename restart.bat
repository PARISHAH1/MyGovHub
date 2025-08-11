@echo off
echo Stopping any existing server...
taskkill /f /im node.exe 2>nul

echo.
echo Starting MyGovHub Server...
echo.

cd /d "%~dp0"
node server.js

pause 