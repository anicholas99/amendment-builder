#!/bin/bash

echo "Setting up Python environment for strikethrough removal..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Check Python version
python_version=$(python -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Found Python version: $python_version"

# Install requirements
echo "Installing Python dependencies..."
pip install -r "$(dirname "$0")/requirements.txt"

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully!"
    echo "You can now use the strikethrough removal feature."
else
    echo "❌ Failed to install Python dependencies."
    echo "Try running: pip install opencv-python numpy Pillow"
    exit 1
fi 