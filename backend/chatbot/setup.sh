#!/bin/bash
# DevWell Chatbot Setup Script
# Creates virtual environment and installs dependencies

set -e  # Exit on error

echo "🚀 Setting up DevWell AI Chatbot..."
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "✅ Virtual environment already exists"
fi
echo ""

# Activate virtual environment and install dependencies
echo "📥 Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo ""

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your API keys to backend/.env:"
echo "   GEMINI_API_KEY=your_gemini_key"
echo "   GROQ_API_KEY=your_groq_key"
echo ""
echo "2. Test the chatbot:"
echo "   cd backend/chatbot"
echo "   source venv/bin/activate"
echo "   python chat.py"
echo ""
echo "3. Update backend/.env PYTHON_PATH to:"
echo "   PYTHON_PATH=$(pwd)/venv/bin/python"
echo ""
