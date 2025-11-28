# DevWell AI Chatbot Setup Guide

## Overview

DevWell AI Assistant uses dual AI models for intelligent health and productivity advice:

- **Gemini 2.0 Flash** (primary): 1M tokens/min, 60 req/min
- **Llama 3.3 70B** (fallback): 7k requests/day, 800 tokens/s

The system automatically tries Gemini first, then falls back to Llama if needed.

---

## Prerequisites

- Python 3.8+ installed
- Node.js backend running
- Frontend React app configured
- API keys for Gemini and Groq

---

## Step 1: Install Python Dependencies

**For Kali Linux / Debian-based systems (externally-managed Python):**

Run the automated setup script:

```bash
cd backend/chatbot
./setup.sh
```

This script will:

- Create a Python virtual environment in `backend/chatbot/venv/`
- Install all required dependencies
- Display the correct PYTHON_PATH for your `.env` file

**Manual setup (alternative):**

```bash
cd backend/chatbot
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**For other systems (without externally-managed restriction):**

```bash
cd backend/chatbot
pip install -r requirements.txt
```

This installs:

- `google-generativeai` - Gemini API client
- `openai` - Groq/Llama API client (OpenAI-compatible)
- `python-dotenv` - Environment variable management

Verify installation:

```bash
# Activate virtual environment first (on Kali/Debian)
source venv/bin/activate

# Test imports
python -c "import google.generativeai; import openai; print('✅ Dependencies installed')"
```

---

## Step 2: Get API Keys

### Gemini API Key

1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

### Groq API Key (for Llama)

1. Visit: https://console.groq.com/keys
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

---

## Step 3: Configure Environment Variables

Edit `/backend/.env` and add your API keys:

```env
# AI Chatbot Configuration
GEMINI_API_KEY=AIzaSyD...YourActualGeminiKey
GROQ_API_KEY=gsk_...YourActualGroqKey
PYTHON_PATH=python3

# Existing DevWell configuration
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Important**: Never commit `.env` to version control!

---

## Step 4: Test Python Chatbot

Test the Python service directly:

```bash
cd backend/chatbot
python3 chat.py
```

You should see:

```
DevWell AI Chatbot
Available models: gemini-2.0-flash, llama-3.3-70b
Mode: chat
```

Try asking:

```
You: What are some tips for reducing eye strain?
```

The chatbot should respond with health advice.

Exit with `Ctrl+C`.

---

## Step 5: Verify Backend Integration

Start the backend server:

```bash
cd backend
npm start
```

Test the health endpoint:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5000/api/chatbot/health
```

Expected response:

```json
{
  "status": "healthy",
  "geminiAvailable": true,
  "llamaAvailable": true,
  "pythonPath": "/usr/bin/python3"
}
```

---

## Step 6: Start Frontend

```bash
cd frontend
npm run dev
```

Navigate to the Dashboard. You should see a floating chatbot button in the bottom-right corner.

---

## Usage

### Chatbot Features

1. **Model Selection**: Choose between Gemini, Llama, or Auto mode
2. **Conversation History**: Last 5 messages sent for context
3. **Auto-Fallback**: Tries Gemini first, falls back to Llama on error
4. **Health Status**: Green dot indicates both models are online

### Example Questions

```
- "What are some desk exercises I can do?"
- "How often should I take breaks?"
- "Tips for better posture while coding?"
- "How can I improve my sleep quality?"
- "What's the best way to prevent burnout?"
```

### Settings Panel

Click the ⚙️ icon to:

- Select AI model (Auto/Gemini/Llama)
- Clear conversation history

---

## Troubleshooting

### "Python environment not available"

**Solution**: Verify Python path in `.env`:

```bash
which python3
# Copy the output path to PYTHON_PATH in .env
```

### "Gemini API key not configured"

**Solution**: Check `.env` has valid `GEMINI_API_KEY`

```bash
grep GEMINI_API_KEY backend/.env
```

### "Rate limit exceeded"

**Solution**: Switch to Llama model or wait:

- Gemini: 60 requests/min
- Llama: 30 requests/min, 7k/day

### Messages not sending

**Solution**: Check browser console and backend logs:

```bash
# Backend logs
cd backend && npm start

# Check network tab in browser DevTools
```

### Chatbot widget not appearing

**Solution**: Verify authentication:

- Must be logged in to use chatbot
- Check JWT token in localStorage
- Try logging out and back in

---

## Architecture

```
User (Frontend)
  ↓
ChatbotWidget.tsx (React Component)
  ↓
useSendMessage() (TanStack Query Hook)
  ↓
chatbot.service.ts (API Client)
  ↓
POST /api/chatbot/message (Protected Route)
  ↓
chatbot.controller.js (Express Controller)
  ↓
chatbot.service.js (Node.js Bridge)
  ↓
child_process.spawn(python3 chat.py)
  ↓
chat.py (Python Service)
  ↓
Gemini 2.0 Flash API / Llama 3.3 70B (Groq)
```

---

## API Quotas

### Gemini 2.0 Flash (Free Tier)

- 1,500 requests/day
- 1M tokens/min
- 60 requests/min
- Max tokens: 8,192

### Llama 3.3 70B via Groq (Free Tier)

- 7,000 requests/day
- 30 requests/min
- 800 tokens/second
- Max tokens: 8,000

**Tip**: Use "Auto" mode to automatically switch between models for optimal quota usage.

---

## Development

### Test Python Service Directly

```bash
cd backend/chatbot
python3 chat.py
```

### Check Backend Service

```bash
# Start backend in debug mode
cd backend
npm run dev

# Test endpoint
curl -X POST http://localhost:5000/api/chatbot/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"message":"Hello","model":"gemini"}'
```

### View Frontend Logs

Open browser DevTools → Console → Filter "chatbot"

---

## Security Notes

- All chatbot endpoints require JWT authentication
- API keys stored server-side only (never exposed to frontend)
- Rate limiting prevents abuse
- Conversation history limited to last 5 messages
- No sensitive data stored in chat logs

---

## Next Steps

1. ✅ Install Python dependencies
2. ✅ Get API keys from Google AI Studio and Groq
3. ✅ Configure `.env` file
4. ✅ Test Python chatbot
5. ✅ Start backend and frontend
6. ✅ Open Dashboard and click chatbot icon
7. 🎉 Start chatting with DevWell AI!

---

## Support

If you encounter issues:

1. Check backend logs: `cd backend && npm start`
2. Check Python: `python3 backend/chatbot/chat.py`
3. Verify API keys are valid
4. Check browser console for errors
5. Ensure you're logged in

For model-specific issues:

- Gemini errors: Check Google AI Studio quota
- Llama errors: Check Groq Console quota
- Both failing: Verify `.env` configuration

---

**Enjoy your AI-powered health and productivity assistant! 🚀**
