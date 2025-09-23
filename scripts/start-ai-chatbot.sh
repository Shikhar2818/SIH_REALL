#!/bin/bash

echo "Starting Dr. Sarah AI Chatbot Service..."
echo "========================================"

cd "$(dirname "$0")/bot"

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Starting AI Chatbot backend..."
python start_backend.py
