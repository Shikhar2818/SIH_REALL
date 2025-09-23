@echo off
echo Starting Dr. Sarah AI Chatbot Service...
echo ========================================

cd /d "%~dp0\bot"

echo Installing Python dependencies...
pip install -r requirements.txt

echo Starting AI Chatbot backend...
python start_backend.py

pause
