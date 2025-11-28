# DevWell - Complete Project Overview

## 🎯 Project Mission

**DevWell** is an AI-powered health monitoring platform for developers that combines:

- Real-time fatigue detection using webcam + AI
- Health & wellness chatbot assistant
- Productivity tracking and suggestions
- Work-life balance monitoring

**Target Users:** Software developers, programmers, tech workers
**Problem Solved:** Developer burnout, poor ergonomics, health deterioration from prolonged coding

---

## 📁 Project Structure

```
DevWell/
├── backend/                    # Node.js/Express/TypeScript API
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── server.ts          # Server entry point
│   │   ├── config/
│   │   │   └── db.ts          # MongoDB connection
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── fatigue.controller.ts
│   │   │   ├── feedback.controller.ts
│   │   │   └── chatbot.controller.ts
│   │   ├── services/          # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── fatigue.service.ts
│   │   │   ├── feedback.service.ts
│   │   │   └── chatbot.service.ts
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── auth/
│   │   │   │   ├── auth.model.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── auth.service.ts
│   │   │   ├── fatigue/
│   │   │   │   ├── fatigue.model.ts
│   │   │   │   ├── fatigue.controller.ts
│   │   │   │   └── fatigue.service.ts
│   │   │   └── feedback/
│   │   │       ├── feedback.model.ts
│   │   │       ├── feedback.controller.ts
│   │   │       └── feedback.service.ts
│   │   ├── routes/            # API endpoints
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── fatigue.routes.ts
│   │   │   ├── feedback.routes.ts
│   │   │   └── chatbot.routes.ts
│   │   └── middleware/
│   │       └── authMiddleware.ts
│   ├── chatbot/               # Python AI service
│   │   ├── venv/              # Virtual environment
│   │   ├── chat.py            # OpenRouter integration
│   │   ├── requirements.txt   # Python dependencies
│   │   └── README.md          # Chatbot docs
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                   # Environment variables
│
├── frontend/                   # React/TypeScript UI
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root component
│   │   ├── router/
│   │   │   └── index.tsx      # TanStack Router config
│   │   ├── pages/             # Route components
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── components/        # Reusable UI
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── PurposeSection.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CameraMonitor.tsx    # Webcam AI detection
│   │   │   ├── DashboardGraph.tsx   # Fatigue charts
│   │   │   ├── SuggestionsBox.tsx   # Health tips
│   │   │   ├── FeedbackForm.tsx     # User feedback
│   │   │   └── ChatbotWidget.tsx    # AI assistant
│   │   ├── hooks/             # TanStack Query hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useFatigue.ts
│   │   │   ├── useFeedback.ts
│   │   │   └── useChatbot.ts
│   │   ├── services/          # API clients
│   │   │   ├── auth.service.ts
│   │   │   ├── fatigue.service.ts
│   │   │   ├── feedback.service.ts
│   │   │   └── chatbot.service.ts
│   │   ├── types/             # TypeScript types
│   │   │   ├── auth.types.ts
│   │   │   ├── fatigue.types.ts
│   │   │   ├── feedback.types.ts
│   │   │   ├── chatbot.types.ts
│   │   │   └── index.ts
│   │   ├── lib/               # Utilities
│   │   │   ├── apiClient.ts         # Axios instance
│   │   │   ├── queryClient.ts       # TanStack Query
│   │   │   └── teachableMachine.ts  # AI model loader
│   │   └── routes/            # TanStack Router files
│   │       └── __root.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env                   # Frontend env vars
│
└── Documentation/
    ├── README.md
    ├── INTEGRATION_GUIDE.md
    ├── FRONTEND_ARCHITECTURE.md
    ├── CHATBOT_SETUP.md
    ├── CHATBOT_FEATURES.md
    └── DEVWELL_PROJECT_OVERVIEW.md (this file)
```

---

## 🏗️ Technical Architecture

### Backend Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (local or Atlas)
- **Authentication:** JWT (jsonwebtoken, bcryptjs)
- **Python Integration:** Child process for AI chatbot
- **Security:** Helmet, CORS

### Frontend Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** TanStack Router
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS v4
- **HTTP Client:** Axios
- **AI Integration:**
  - Teachable Machine (Google) for fatigue detection
  - OpenRouter API for chatbot

### AI Services

- **Fatigue Detection:** Teachable Machine image model (browser-based)
- **Chatbot:** OpenRouter with Llama 3.3 70B (server-side)
- **Future:** Code assistance models, research models

---

## 🔐 Authentication Flow

```
1. User Registration
   Frontend → POST /api/auth/register
   Backend → Hash password (bcrypt) → Save to MongoDB
   Response → { token, user }

2. User Login
   Frontend → POST /api/auth/login
   Backend → Verify password → Generate JWT
   Response → { token, user }

3. Protected Routes
   Frontend → Add token to headers (Authorization: Bearer <token>)
   Backend → authMiddleware verifies JWT
   Response → Authenticated user data

4. Profile Management
   Frontend → GET /api/auth/me (with token)
   Backend → Decode token → Fetch user from DB
   Response → User profile
```

---

## 📊 Core Features

### 1. Fatigue Detection System

**Frontend (CameraMonitor.tsx):**

```typescript
- Requests webcam permission
- Loads Teachable Machine model from URL
- Captures video frame every 3 seconds
- Predicts fatigue level (Normal, Tired, Fatigued)
- If confidence > 60%, sends to backend
```

**Backend (fatigue.controller.ts):**

```typescript
POST /api/fatigue/detect
- Validates authentication
- Saves fatigue event to MongoDB
- Returns event with timestamp

GET /api/fatigue/history?limit=50
- Returns user's fatigue history
- Sorted by timestamp (newest first)
```

**Database Schema (fatigue.model.ts):**

```javascript
{
  userId: ObjectId,
  status: 'Normal' | 'Tired' | 'Fatigued',
  confidence: Number,
  timestamp: Date,
  location: String (optional),
  notes: String (optional)
}
```

### 2. AI Chatbot Assistant

**Frontend (ChatbotWidget.tsx):**

```typescript
Features:
- Floating widget (bottom-right)
- Maximize/Minimize modes
- Markdown rendering (ReactMarkdown)
- Code syntax highlighting (react-syntax-highlighter)
- Conversation history (last 5 messages)
- Model selection (Auto, OpenRouter)
```

**Backend (chatbot.service.ts):**

```typescript
POST /api/chatbot/message
- Receives: { message, model, conversationHistory }
- Calls Python service via child_process
- Uses base64 encoding for JSON safety
- Returns: { success, response, model }

GET /api/chatbot/health
- Checks if Python service is working
- Returns: { status, geminiAvailable, llamaAvailable }

GET /api/chatbot/capabilities
- Lists available models and features
```

**Python Service (chat.py):**

```python
def chat(prompt, model='auto', conversation_history=[]):
    - Uses OpenRouter API exclusively
    - Model options: auto, openrouter, llama, gemini (all via OpenRouter)
    - Default: Llama 3.3 70B (free tier)
    - Returns: { success, response, model }
```

### 3. Feedback System

**Frontend (FeedbackForm.tsx):**

```typescript
- Category selection (Bug, Feature Request, Improvement, Other)
- Message textarea
- Submits to backend
- Success notification
```

**Backend (feedback.controller.ts):**

```typescript
POST /api/feedback/add
- Saves feedback with userId
- Returns created feedback

GET /api/feedback/list?limit=10
- Returns user's feedback
- Admin can see all feedback
```

### 4. Dashboard Analytics

**DashboardGraph.tsx:**

```typescript
- Displays fatigue events over time
- Chart with time on X-axis, status on Y-axis
- Color coding: Green (Normal), Yellow (Tired), Red (Fatigued)
- Last 50 events
```

**SuggestionsBox.tsx:**

```typescript
- Health tips based on fatigue level
- Break reminders
- Ergonomics advice
- Hydration suggestions
```

---

## 🗄️ Database Models

### User Model (auth.model.ts)

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### Fatigue Log Model (fatigue.model.ts)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  status: 'Normal' | 'Tired' | 'Fatigued',
  confidence: Number,
  timestamp: Date,
  location: String,
  notes: String
}
```

### Feedback Model (feedback.model.ts)

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Other',
  message: String (required),
  createdAt: Date,
  status: 'Pending' | 'Reviewed' | 'Resolved'
}
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login user
GET    /api/auth/me            Get current user profile (protected)
```

### User Management

```
PUT    /api/user/profile       Update user profile (protected)
DELETE /api/user/account       Delete account (protected)
```

### Fatigue Detection

```
POST   /api/fatigue/detect     Log fatigue event (protected)
GET    /api/fatigue/history    Get fatigue history (protected)
                               Query params: limit (default 50)
```

### Feedback

```
POST   /api/feedback/add       Submit feedback (protected)
GET    /api/feedback/list      Get feedback list (protected)
                               Query params: limit (default 10)
```

### Chatbot

```
POST   /api/chatbot/message    Send message to AI (protected)
                               Body: { message, model, conversationHistory }
GET    /api/chatbot/health     Check chatbot service status
GET    /api/chatbot/capabilities  List available models
```

### Test

```
GET    /api/test               Health check endpoint
```

---

## 🔑 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devwell
JWT_SECRET=your-super-secret-jwt-key
PYTHON_PATH=/path/to/backend/chatbot/venv/bin/python
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_TM_MODEL_URL=https://teachablemachine.withgoogle.com/models/your-model/
```

---

## 🚀 Deployment Guide

### Backend Deployment

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Setup Python environment:**

   ```bash
   cd chatbot
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure environment:**

   - Create `.env` file
   - Add MongoDB URI (local or Atlas)
   - Add JWT secret
   - Add OpenRouter API key
   - Set Python path

4. **Build and run:**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Install chatbot packages:**

   ```bash
   npm install react-markdown remark-gfm react-syntax-highlighter @types/react-syntax-highlighter --legacy-peer-deps
   ```

3. **Configure environment:**

   - Create `.env` file
   - Set VITE_API_URL to backend URL
   - Set VITE_TM_MODEL_URL to your Teachable Machine model

4. **Build and run:**
   ```bash
   npm run dev          # Development
   npm run build        # Production
   npm run preview      # Preview build
   ```

---

## 🎨 UI/UX Features

### Landing Page

- Hero section with CTA buttons
- About section explaining the problem
- Purpose section with features
- Footer with links

### Authentication Pages

- Clean, modern login/register forms
- Form validation with React Hook Form
- Error handling
- Success redirects

### Dashboard

- Sticky navbar with user info
- Real-time camera monitor (webcam required)
- Fatigue history graph
- Health suggestions box
- Feedback form
- AI chatbot widget (floating, bottom-right)

### Chatbot Widget

- **Compact mode:** 384px × 600px
- **Expanded mode:** ~90% of screen (for code examples)
- Markdown rendering (bold, italic, headers, lists, links)
- Code syntax highlighting (TypeScript, Python, JavaScript, etc.)
- Conversation history
- Model selection
- Settings panel
- Minimize/Maximize buttons

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test  # (if configured)
```

### Frontend Tests

```bash
cd frontend
npm test  # (if configured)
```

### Manual Testing

**Test chatbot Python service:**

```bash
cd backend/chatbot
source venv/bin/activate
python3 << EOF
from chat import chat
import json
print(json.dumps(chat('Hello!', 'auto', []), indent=2))
EOF
```

**Test backend API:**

```bash
# Health check
curl http://localhost:5000/api/test

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Get profile (replace TOKEN)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ Troubleshooting

### Backend Issues

**MongoDB connection fails:**

- Check MONGO_URI in `.env`
- Ensure MongoDB is running (local) or accessible (Atlas)
- Verify network connectivity

**Chatbot returns errors:**

- Check OPENROUTER_API_KEY is set
- Verify Python virtual environment is activated
- Test chat.py directly
- Check backend logs for Python errors

**Port 5000 already in use:**

```bash
lsof -ti:5000 | xargs kill -9
```

### Frontend Issues

**API calls fail:**

- Verify VITE_API_URL points to correct backend
- Check backend is running on correct port
- Inspect browser console for CORS errors

**Camera not working:**

- Grant webcam permission in browser
- Check VITE_TM_MODEL_URL is set
- Verify Teachable Machine model is public

**Chatbot markdown not rendering:**

- Install required packages:
  ```bash
  npm install react-markdown remark-gfm react-syntax-highlighter @types/react-syntax-highlighter --legacy-peer-deps
  ```
- Restart dev server

**401 Unauthorized errors:**

- Check JWT token in localStorage
- Re-login to get fresh token
- Verify authMiddleware is working

---

## 📈 Future Roadmap

### Phase 1: Health & Wellness (✅ Complete)

- [x] Fatigue detection with AI
- [x] Health chatbot assistant
- [x] Dashboard with analytics
- [x] Feedback system

### Phase 2: Enhanced Chatbot (🚧 In Progress)

- [x] Markdown formatting
- [x] Code syntax highlighting
- [x] Maximize/minimize window
- [ ] Multi-modal AI (voice input)
- [ ] Context-aware responses

### Phase 3: Code Assistance (📋 Planned)

- [ ] Code review capabilities
- [ ] Bug detection
- [ ] Performance optimization suggestions
- [ ] Best practices recommendations
- [ ] Code completion integration

### Phase 4: Research & Trends (💡 Future)

- [ ] Tech news aggregation
- [ ] Library/framework updates
- [ ] Security vulnerability alerts
- [ ] Learning resource recommendations
- [ ] Design pattern database

### Phase 5: Advanced Features (🔮 Vision)

- [ ] Team collaboration features
- [ ] Manager dashboard
- [ ] Productivity analytics
- [ ] Break scheduling
- [ ] Integration with IDEs (VS Code extension)

---

## 🤝 Contributing

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Architecture Principles

- **Separation of Concerns:** Controllers, Services, Models
- **Type Safety:** Define types for all API responses
- **Error Handling:** Try-catch in all async functions
- **Security:** Never commit API keys or secrets
- **Documentation:** Comment complex logic

### Pull Request Process

1. Fork the repository
2. Create feature branch (`feature/amazing-feature`)
3. Make changes with tests
4. Update documentation
5. Submit PR with description

---

## 📄 License

This project is part of DevWell - Developer Health & Productivity Platform.

---

## 📞 Support

For issues, questions, or contributions:

- GitHub Issues: [DevWell Issues](https://github.com/anas-kessou/DevWell/issues)
- Email: support@devwell.com (if configured)
- Discord: DevWell Community (if configured)

---

## 🙏 Acknowledgments

- **Teachable Machine** by Google - AI fatigue detection
- **OpenRouter** - Multi-model AI API
- **TanStack** - Router and Query libraries
- **Tailwind CSS** - UI styling
- **MongoDB** - Database
- **React** - Frontend framework
- **Express** - Backend framework

---

**Built with ❤️ for developers who care about their health and productivity.**
