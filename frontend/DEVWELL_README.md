# DevWell Frontend

React + TypeScript + TanStack Router frontend for the DevWell fatigue detection system.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Type-safe routing
- **Tailwind CSS** (recommended) - Styling

## Features

- 🔐 **Authentication** - JWT-based login and registration
- 📹 **Camera Monitor** - Real-time fatigue detection via webcam
- 📊 **Dashboard** - View fatigue history and analytics
- 💡 **Health Suggestions** - AI-powered wellness recommendations
- 💬 **Feedback System** - Submit user feedback

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:5000`

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file (or copy from `.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

### Development

```bash
# Start dev server (usually runs on http://localhost:5173)
npm run dev
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/              # API client functions
│   ├── authApi.ts
│   ├── fatigueApi.ts
│   └── feedbackApi.ts
├── components/       # Reusable UI components
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── AboutSection.tsx
│   ├── PurposeSection.tsx
│   ├── Footer.tsx
│   ├── CameraMonitor.tsx
│   ├── DashboardGraph.tsx
│   ├── SuggestionsBox.tsx
│   └── FeedbackForm.tsx
├── pages/            # Page components
│   ├── LandingPage.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Dashboard.tsx
├── router.tsx        # TanStack Router configuration
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

## API Integration

All API calls are made through the files in `src/api/`:

- **authApi.ts** - Authentication (login, register, profile)
- **fatigueApi.ts** - Fatigue detection and history
- **feedbackApi.ts** - User feedback

These use the `VITE_API_URL` environment variable to connect to the backend.

## Routing

The app uses TanStack Router for type-safe routing:

- `/` - Landing page with hero and info sections
- `/login` - User login
- `/register` - New user registration
- `/dashboard` - Protected dashboard (requires auth)

## Authentication Flow

1. User registers or logs in
2. JWT token stored in localStorage
3. Token sent with all API requests via `Authorization: Bearer <token>`
4. Dashboard checks authentication on mount
5. Logout clears token and redirects to home

## Camera Permissions

The dashboard's camera monitor requires webcam access. Users must grant permission when prompted.

## Development Notes

- React Compiler is enabled via Babel plugin
- TanStack Router Vite plugin generates route types automatically
- All components use TypeScript for type safety
- Error handling includes user-friendly messages

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge).
