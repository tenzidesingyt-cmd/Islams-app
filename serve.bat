@echo off
cd /d "%~dp0"
set "PY="
if exist "%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe" set "PY=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\python\python.exe"
if not defined PY (
  where python >nul 2>nul
  if not errorlevel 1 set "PY=python"
)
if defined PY (
  echo Local server: http://localhost:8080/index.html
  echo On your phone use http://YOUR-PC-IP:8080 (same Wi-Fi^).
  echo Press Ctrl+C to stop.
  start "" "http://localhost:8080/index.html"
  "%PY%" -m http.server 8080
) else (
  echo Python was not found. Opening index.html directly...
  echo For PWA install use GitHub Pages or any static hosting.
  start "" "index.html"
)
