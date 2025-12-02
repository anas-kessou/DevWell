# DevWell - Developer Health & Productivity Platform

**DevWell** is an AI-powered health monitoring platform designed specifically for developers. It combats burnout and health deterioration by combining real-time fatigue detection with an intelligent wellness assistant.

---

## 🎯 Project Mission

Developers often face burnout, poor ergonomics, and health issues due to prolonged coding sessions. DevWell solves this by providing:
- **Real-time Fatigue Detection**: Uses your webcam and AI to monitor signs of fatigue.
- **AI Health Assistant**: A chatbot that provides wellness tips, ergonomics advice, and productivity suggestions.
- **Data-Driven Insights**: A dashboard to track your fatigue levels and health trends over time.

---

## 🚀 Key Features

- **👁️ AI Fatigue Monitor**: Runs locally in your browser using TensorFlow.js / Teachable Machine to detect if you are "Normal", "Tired", or "Fatigued".
- **🤖 Intelligent Chatbot**: Powered by OpenRouter (Llama 3.3 70B), offering context-aware health and coding assistance.
- **📊 Analytics Dashboard**: Visualizes your energy levels with interactive graphs.
- **💡 Smart Suggestions**: Provides actionable health tips based on your current state.
- **🔒 Privacy-First**: Fatigue analysis happens locally; only status events are logged.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Routing**: TanStack Router
- **AI Integration**: TensorFlow.js (Teachable Machine)

### Backend
- **Runtime**: Node.js & Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **Authentication**: JWT & BCrypt
- **AI Service**: Python microservice for Chatbot (OpenRouter API)

---

## 📂 Project Structure

```
DevWell/
├── backend/                # Express.js API & Python Chatbot Service
│   ├── src/               # Controllers, Models, Services, Routes
│   └── chatbot/           # Python environment for AI
├── frontend/               # React Application
│   ├── src/               # Components, Pages, Hooks, Services
│   └── public/            # Static assets
└── Documentation/          # Detailed project documentation
```

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)
- MongoDB (Local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install

# Setup Python environment for Chatbot
cd chatbot
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Configure Environment
cp .env.example .env
# Edit .env with your MongoDB URI and OpenRouter API Key

# Start Server
npm run build
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure Environment
cp .env.example .env
# Ensure VITE_API_URL points to your backend (default: http://localhost:5000/api)

# Start Development Server
npm run dev
```

---

## 🔑 Environment Variables

**Backend (.env)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devwell
JWT_SECRET=your_jwt_secret
OPENROUTER_API_KEY=your_openrouter_key
PYTHON_PATH=./chatbot/venv/bin/python
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
VITE_TM_MODEL_URL=https://teachablemachine.withgoogle.com/models/your-model/
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Authenticate user |
| `POST` | `/api/fatigue/detect` | Log a fatigue event |
| `POST` | `/api/chatbot/message` | Send message to AI assistant |
| `GET` | `/api/fatigue/history` | Get user's fatigue history |

---

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](Documentation/DEVWELL_PROJECT_OVERVIEW.md#contributing) for more details.

---

## 📄 License

This project is licensed under the MIT License.
