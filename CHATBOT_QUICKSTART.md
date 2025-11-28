# DevWell AI Chatbot - Quick Start

## ✅ Setup Complete!

Your Python virtual environment is ready with all dependencies installed.

---

## 🔑 Get Your API Keys (Required)

### 1. Gemini API Key (Google)

- Visit: **https://aistudio.google.com/app/apikey**
- Sign in with Google account
- Click "Create API Key"
- Copy the key (starts with `AIza...`)

### 2. Groq API Key (for Llama)

- Visit: **https://console.groq.com/keys**
- Sign up or log in
- Click "Create API Key"
- Copy the key (starts with `gsk_...`)

---

## ⚙️ Configure Environment

Edit `/home/kali/Desktop/DevWell/backend/.env`:

```env
GEMINI_API_KEY=AIzaSyD...YourActualGeminiKey
GROQ_API_KEY=gsk_...YourActualGroqKey
PYTHON_PATH=/home/kali/Desktop/DevWell/backend/chatbot/venv/bin/python
```

**Important:** The `PYTHON_PATH` is already set correctly for your Kali Linux system!

---

## 🧪 Test the Chatbot

### Option 1: Test Python service directly

```bash
cd backend/chatbot
source venv/bin/activate
python chat.py
```

Then type questions like:

- "What are some desk exercises?"
- "Tips for reducing eye strain?"

### Option 2: Test full stack

```bash
# Terminal 1: Start backend
cd backend
npm start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Then:

1. Open http://localhost:5173
2. Log in to Dashboard
3. Click the chatbot icon (bottom-right)
4. Start chatting!

---

## 🎯 Chatbot Features

- **Dual AI Models**: Gemini 2.0 Flash (fast) + Llama 3.3 70B (powerful)
- **Auto Fallback**: Tries Gemini first, switches to Llama if needed
- **Conversation Memory**: Remembers last 5 messages
- **Model Selection**: Choose Gemini, Llama, or Auto mode
- **DevWell Expertise**: Specialized in health, productivity, and fatigue management

---

## 📊 API Quotas

### Gemini 2.0 Flash (Free)

- ✅ 1,500 requests/day
- ✅ 1M tokens/min
- ✅ 60 requests/min

### Llama 3.3 70B (Free via Groq)

- ✅ 7,000 requests/day
- ✅ 30 requests/min
- ✅ 800 tokens/second

**Tip:** Use "Auto" mode for best results!

---

## 🐛 Troubleshooting

### "Python dependencies not found"

```bash
cd backend/chatbot
./setup.sh
```

### "API key not configured"

Check `backend/.env` has valid keys:

```bash
grep GEMINI_API_KEY backend/.env
grep GROQ_API_KEY backend/.env
```

### "Python environment not available"

The `.env` should have:

```
PYTHON_PATH=/home/kali/Desktop/DevWell/backend/chatbot/venv/bin/python
```

### Chatbot not appearing

- Ensure you're logged in
- Check browser console (F12)
- Verify backend is running on port 5000

---

## 📝 Files Created

```
backend/
  chatbot/
    venv/              # Python virtual environment ✅
    chat.py            # Python chatbot service
    requirements.txt   # Dependencies
    setup.sh          # Automated setup script ✅
    test.sh           # Test dependencies ✅
  src/
    services/chatbot.service.js
    controllers/chatbot.controller.js
    routes/chatbot.routes.js
  .env               # Updated with PYTHON_PATH ✅

frontend/
  src/
    components/ChatbotWidget.tsx
    types/chatbot.types.ts
    services/chatbot.service.ts
    hooks/useChatbot.ts
```

---

## 🚀 You're All Set!

**Next:** Add your API keys to `backend/.env` and start chatting!

For detailed documentation, see: `CHATBOT_SETUP.md`
