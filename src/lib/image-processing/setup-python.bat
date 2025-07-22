@echo off

echo Setting up Python environment for strikethrough removal...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed. Please install Python 3.7+ first.
    pause
    exit /b 1
)

REM Check Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set python_version=%%i
echo Found Python version: %python_version%

REM Install requirements
echo Installing Python dependencies...
pip install -r "%~dp0requirements.txt"

if %errorlevel% equ 0 (
    echo ✅ Python dependencies installed successfully!
    echo You can now use the strikethrough removal feature.
) else (
    echo ❌ Failed to install Python dependencies.
    echo Try running: pip install opencv-python numpy Pillow
    pause
    exit /b 1
)

pause 