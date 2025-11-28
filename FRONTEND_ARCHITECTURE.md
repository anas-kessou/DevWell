# DevWell Frontend Architecture Guide

## 📋 Table of Contents

1. [Bootstrap Flow](#bootstrap-flow)
2. [Project Structure](#project-structure)
3. [Routing Architecture](#routing-architecture)
4. [TanStack Query Setup](#tanstack-query-setup)
5. [API Client & Services](#api-client--services)
6. [Component Organization](#component-organization)
7. [State Management](#state-management)
8. [TypeScript Types](#typescript-types)
9. [Data Flow](#data-flow)
10. [Authentication](#authentication)
11. [Form Handling](#form-handling)
12. [Best Practices](#best-practices)

---

## 1. Bootstrap Flow

### Execution Path

```
src/main.tsx (Entry Point)
  ↓
QueryClientProvider (TanStack Query setup)
  ↓
ReactQueryDevtools (Development tools)
  ↓
App.tsx
  ↓
AppRouter (from src/router/index.tsx)
  ↓
BrowserRouter
  ↓
Routes → Protected/Public Pages
```

### main.tsx

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

**Key Points:**

- `StrictMode`: Enables development warnings for React best practices
- `QueryClientProvider`: Makes TanStack Query available globally
- `ReactQueryDevtools`: Visual query inspector (dev only)
- `queryClient`: Configured instance from `lib/queryClient.ts`

---

## 2. Project Structure

```
frontend/src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root component
├── index.css                   # Global styles (Tailwind)
│
├── router/
│   └── index.tsx              # Route configuration + ProtectedRoute logic
│
├── pages/                      # Route components
│   ├── LandingPage.tsx        # Public home page
│   ├── Login.tsx              # Login page with React Hook Form
│   ├── Register.tsx           # Registration with validation
│   └── Dashboard.tsx          # Protected dashboard
│
├── components/                 # Reusable UI components
│   ├── ProtectedRoute.tsx     # Auth guard for routes
│   ├── CameraMonitor.tsx      # TM face detection
│   ├── DashboardGraph.tsx     # Fatigue statistics
│   ├── FeedbackForm.tsx       # Feedback submission
│   ├── Navbar.tsx             # Navigation
│   ├── Hero.tsx               # Landing hero section
│   └── ...
│
├── hooks/                      # Custom TanStack Query hooks
│   ├── useAuth.ts             # Auth queries & mutations
│   ├── useFatigue.ts          # Fatigue monitoring
│   ├── useFeedback.ts         # Feedback management
│   └── index.ts               # Central export
│
├── services/                   # API service layer
│   ├── auth.service.ts        # Auth HTTP calls
│   ├── fatigue.service.ts     # Fatigue HTTP calls
│   ├── feedback.service.ts    # Feedback HTTP calls
│   └── index.ts               # Central export
│
├── types/                      # TypeScript interfaces
│   ├── auth.types.ts          # User, Login, Register types
│   ├── fatigue.types.ts       # FatigueLog, Detection types
│   ├── feedback.types.ts      # Feedback types
│   └── index.ts               # Central export
│
├── lib/                        # Utility libraries
│   ├── apiClient.ts           # Axios instance with interceptors
│   ├── queryClient.ts         # TanStack Query config + query keys
│   └── teachableMachine.ts    # TM model wrapper
│
└── api/                        # Legacy API files (can be removed)
    └── ...
```

---

## 3. Routing Architecture

### Router Configuration (src/router/index.tsx)

```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
```

### Protected Route Component

```typescript
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: user, isLoading, error } = useProfile();
  const hasToken = tokenManager.isAuthenticated();

  if (!hasToken) return <Navigate to="/login" replace />;
  if (isLoading) return <LoadingSpinner />;
  if (error || !user) {
    tokenManager.removeToken();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

**Pattern Benefits:**

- Centralized route configuration
- Type-safe routing
- Protected routes enforce authentication
- Loading states handled automatically
- Invalid tokens cleared and redirected

---

## 4. TanStack Query Setup

### QueryClient Configuration (lib/queryClient.ts)

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - how long data is fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache retention
      retry: 1, // Retry failed requests once
      refetchOnWindowFocus: true, // Refetch when tab regains focus
      refetchOnReconnect: true, // Refetch on network reconnect
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});
```

### Query Keys Factory

```typescript
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },
  fatigue: {
    all: ["fatigue"] as const,
    history: (params?) =>
      [...queryKeys.fatigue.all, "history", params] as const,
    today: () => [...queryKeys.fatigue.all, "today"] as const,
  },
  feedback: {
    all: ["feedback"] as const,
    recent: (limit?) => [...queryKeys.feedback.all, "recent", limit] as const,
  },
};
```

**Query Key Benefits:**

- Hierarchical structure for easy invalidation
- Type-safe with TypeScript
- Prevents cache conflicts
- Easy to invalidate entire entity type: `queryClient.invalidateQueries({ queryKey: queryKeys.fatigue.all })`

---

## 5. API Client & Services

### HTTP Client (lib/apiClient.ts)

```typescript
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(error.response?.data?.msg || "An error occurred");
  }
);
```

### Service Layer (services/auth.service.ts)

```typescript
import { apiClient } from "../lib/apiClient";
import type { RegisterRequest, LoginRequest, AuthResponse } from "../types";

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  getProfile: async (): Promise<GetProfileResponse> => {
    const response = await apiClient.get<GetProfileResponse>("/auth/me");
    return response.data;
  },
};
```

**Separation of Concerns:**

- `apiClient`: HTTP communication layer
- `services`: API endpoint abstraction
- `hooks`: React-specific query/mutation logic
- `components`: UI rendering only

---

## 6. Component Organization

### Component Categories

**1. Pages (Route Components)**

- Located in `src/pages/`
- Compose multiple components
- Use custom hooks for data fetching
- Handle page-level state

**2. Shared Components**

- Located in `src/components/`
- Reusable across multiple pages
- Accept props for customization
- No direct API calls (use hooks instead)

**3. Protected Components**

- Wrapped in `<ProtectedRoute>`
- Only accessible when authenticated
- Example: Dashboard

### Component Pattern Example

```typescript
// Dashboard.tsx - Page Component
export default function Dashboard() {
  const { data: user } = useProfile();
  const { logs, refetch } = useFatigueMonitor();

  return (
    <div>
      <Navbar user={user} />
      <CameraMonitor onDetection={() => refetch()} />
      <DashboardGraph logs={logs} />
      <FeedbackForm />
    </div>
  );
}
```

---

## 7. State Management

### Three Types of State

**1. Server State (TanStack Query)**

- User profile
- Fatigue history
- Feedback list
- Managed by query hooks

**2. UI State (React useState)**

- Modal open/close
- Form input values (with React Hook Form)
- Loading indicators
- Alert visibility

**3. URL State (React Router)**

- Current route/page
- Route parameters
- Navigation history

### No Global State Management Needed

- TanStack Query cache acts as global server state
- No Redux/Zustand required for simple apps
- Context API only for theme/locale if needed

---

## 8. TypeScript Types

### Type Organization

```
types/
├── auth.types.ts       # User, LoginRequest, RegisterRequest
├── fatigue.types.ts    # FatigueLog, FatigueLevel, DetectFatigueRequest
├── feedback.types.ts   # Feedback, AddFeedbackRequest
└── index.ts            # Central export + shared types
```

### Type Flow

```
Backend MongoDB Schema
  ↓
types/auth.types.ts → User interface
  ↓
services/auth.service.ts → Typed API calls
  ↓
hooks/useAuth.ts → Typed React hooks
  ↓
components/Dashboard.tsx → Typed props
```

### Type Safety Benefits

- Autocomplete in VS Code
- Compile-time error checking
- Refactoring safety
- Self-documenting code

---

## 9. Data Flow

### Complete Data Flow Example: Login

```
1. User fills form in Login.tsx
   ↓
2. React Hook Form validates input
   ↓
3. useLogin() hook called
   ↓
4. authService.login() makes HTTP POST
   ↓
5. apiClient adds JWT token to headers
   ↓
6. Backend validates and returns token
   ↓
7. Mutation onSuccess: token saved to localStorage
   ↓
8. Query cache updated with user data
   ↓
9. Navigate to /dashboard
   ↓
10. ProtectedRoute checks useProfile()
   ↓
11. Dashboard renders with cached user data
```

### Fatigue Detection Flow

```
1. CameraMonitor captures webcam frame
   ↓
2. Teachable Machine model predicts fatigue level
   ↓
3. If confidence > 60%, useDetectFatigue() mutation called
   ↓
4. Optimistic update: Add to cache immediately
   ↓
5. fatigueService.detectFatigue() sends to backend
   ↓
6. Backend saves to MongoDB
   ↓
7. On success: Invalidate fatigue queries
   ↓
8. TanStack Query refetches latest data
   ↓
9. DashboardGraph re-renders with new data
```

---

## 10. Authentication

### Auth Flow

**Registration:**

```typescript
const registerMutation = useRegister();

const onSubmit = async (data: RegisterFormData) => {
  await registerMutation.mutateAsync({
    username: data.username,
    email: data.email,
    password: data.password,
  });
  navigate("/dashboard");
};
```

**Login:**

```typescript
const loginMutation = useLogin();

const onSubmit = async (data: LoginRequest) => {
  await loginMutation.mutateAsync(data);
  navigate("/dashboard");
};
```

**Token Storage:**

- JWT token stored in `localStorage`
- Auto-injected in all requests via axios interceptor
- Auto-logout on 401 responses

**Profile Fetching:**

```typescript
// Automatic on protected route access
const { data: user, isLoading } = useProfile();
```

---

## 11. Form Handling

### React Hook Form Integration

**Login Form:**

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<LoginRequest>();

<form onSubmit={handleSubmit(onSubmit)}>
  <input
    {...register("email", {
      required: "Email is required",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email",
      },
    })}
  />
  {errors.email && <p>{errors.email.message}</p>}
</form>;
```

**Form + Mutation Pattern:**

```typescript
const mutation = useLogin();

const onSubmit = async (data: LoginRequest) => {
  try {
    await mutation.mutateAsync(data);
    // Success handling
  } catch (error) {
    // Error shown via mutation.error
  }
};

{
  mutation.error && <div>{mutation.error.message}</div>;
}
<button disabled={mutation.isPending}>
  {mutation.isPending ? "Loading..." : "Submit"}
</button>;
```

---

## 12. Best Practices

### ✅ DO

1. **Separate Concerns**

   - Services: API calls only
   - Hooks: React Query logic
   - Components: UI rendering

2. **Use TanStack Query for Server State**

   - Automatic caching
   - Background refetching
   - Optimistic updates

3. **Type Everything**

   - Define types in `types/` directory
   - Share types between frontend and backend

4. **Use Query Keys Factory**

   - Centralized in `lib/queryClient.ts`
   - Hierarchical structure
   - Easy cache invalidation

5. **Handle Loading & Error States**

   ```typescript
   const { data, isLoading, error } = useQuery(...);

   if (isLoading) return <Loading />;
   if (error) return <Error message={error.message} />;
   return <Component data={data} />;
   ```

6. **Optimistic Updates for Better UX**
   ```typescript
   useMutation({
     onMutate: async (newData) => {
       await queryClient.cancelQueries({ queryKey });
       const previous = queryClient.getQueryData(queryKey);
       queryClient.setQueryData(queryKey, optimisticValue);
       return { previous };
     },
     onError: (err, vars, context) => {
       queryClient.setQueryData(queryKey, context.previous);
     },
   });
   ```

### ❌ DON'T

1. **Don't Mix Server State with useState**

   - ❌ `const [users, setUsers] = useState([])`
   - ✅ `const { data: users } = useQuery(...)`

2. **Don't Call APIs Directly in Components**

   - ❌ `axios.get('/api/users')` in component
   - ✅ `const { data } = useUsers()` hook

3. **Don't Forget to Invalidate Queries**

   - After mutations, invalidate related queries
   - `queryClient.invalidateQueries({ queryKey: queryKeys.fatigue.all })`

4. **Don't Hardcode API URLs**

   - ✅ Use environment variables: `VITE_API_URL`

5. **Don't Ignore TypeScript Errors**
   - Fix type issues immediately
   - Add proper types instead of `any`

---

## 🎯 Key Takeaways

1. **TanStack Query is your server state manager** - No need for Redux for API data
2. **Services abstract API calls** - Components never import axios directly
3. **Custom hooks encapsulate query logic** - Reusable across components
4. **React Hook Form handles forms** - Validation, submission, error handling
5. **Protected routes use useProfile** - Automatic auth checking with loading states
6. **Query keys are hierarchical** - Easy to invalidate related data
7. **Optimistic updates improve UX** - Update UI before server responds
8. **Types flow from backend to UI** - Single source of truth

---

## 📚 Further Reading

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Hook Form Docs](https://react-hook-form.com/)
- [React Router Docs](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**This architecture is production-ready and scales well for applications with complex server state management needs.**
