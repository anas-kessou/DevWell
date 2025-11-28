#!/bin/bash
# Quick test script for chatbot (without API keys)

echo "🧪 Testing DevWell Chatbot Setup..."
echo ""

# Activate virtual environment
source /home/kali/Desktop/DevWell/backend/chatbot/venv/bin/activate

# Test Python imports
echo "📦 Testing Python dependencies..."
python -c "
import sys
try:
    import google.generativeai
    print('✅ google-generativeai imported successfully')
except ImportError as e:
    print('❌ Failed to import google-generativeai:', e)
    sys.exit(1)

try:
    import openai
    print('✅ openai imported successfully')
except ImportError as e:
    print('❌ Failed to import openai:', e)
    sys.exit(1)

try:
    from dotenv import load_dotenv
    print('✅ python-dotenv imported successfully')
except ImportError as e:
    print('❌ Failed to import python-dotenv:', e)
    sys.exit(1)

print('')
print('✅ All dependencies are properly installed!')
print('')
print('📝 Next steps:')
print('1. Get API keys from:')
print('   - Gemini: https://aistudio.google.com/app/apikey')
print('   - Groq: https://console.groq.com/keys')
print('')
print('2. Add them to backend/.env:')
print('   GEMINI_API_KEY=your_key_here')
print('   GROQ_API_KEY=your_key_here')
print('')
print('3. Test with: cd backend/chatbot && source venv/bin/activate && python chat.py')
"
