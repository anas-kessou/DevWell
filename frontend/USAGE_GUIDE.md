# Quick Reference - Using Installed Dependencies

## Tailwind CSS

### Basic Usage
```tsx
// Simple styling
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello World
</div>

// Responsive design
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>

// Hover states
<button className="bg-blue-500 hover:bg-blue-700 transition">
  Hover me
</button>

// Flexbox
<div className="flex items-center justify-between gap-4">
  <span>Left</span>
  <span>Right</span>
</div>

// Grid
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Lucide React Icons

### Basic Usage
```tsx
import { Camera, User, Settings, Home } from 'lucide-react';

// Simple icon
<Camera />

// Sized icon
<Camera size={24} />

// Colored icon
<Camera className="text-blue-500" />

// With Tailwind classes
<Camera className="w-6 h-6 text-gray-700 hover:text-blue-500" />
```

### Common Icons
- **Navigation**: Home, Menu, X, ChevronRight, ArrowLeft
- **User**: User, UserPlus, LogIn, LogOut, Settings
- **Media**: Camera, Video, Image, Music, Play
- **Communication**: Mail, MessageSquare, Phone, Send
- **Actions**: Edit, Trash2, Save, Download, Upload
- **Status**: Check, X, AlertCircle, Info, AlertTriangle

## React Router DOM

### Basic Setup
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Navigation
```tsx
import { Link, useNavigate } from 'react-router-dom';

// Link component
<Link to="/dashboard">Go to Dashboard</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate('/login');
navigate(-1); // Go back
```

### Protected Routes
```tsx
function ProtectedRoute({ children }) {
  const isAuthenticated = // check auth
  return isAuthenticated ? children : <Navigate to="/login" />;
}

<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

## Supabase

### Authentication
```tsx
import { supabase } from './lib/supabase';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Sign out
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

### Database Operations
```tsx
// Insert
const { data, error } = await supabase
  .from('fatigue_logs')
  .insert({ 
    fatigue_level: 'alert', 
    confidence: 0.95 
  });

// Select
const { data, error } = await supabase
  .from('fatigue_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);

// Update
const { data, error } = await supabase
  .from('fatigue_logs')
  .update({ fatigue_level: 'focused' })
  .eq('id', logId);

// Delete
const { data, error } = await supabase
  .from('fatigue_logs')
  .delete()
  .eq('id', logId);
```

### Using Auth Context
```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, loading, signOut } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## clsx Utility

### Conditional Classes
```tsx
import clsx from 'clsx';

// Conditional classes
<div className={clsx(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class'
)} />

// With object syntax
<div className={clsx({
  'bg-blue-500': isPrimary,
  'bg-gray-500': !isPrimary,
  'text-white': true,
  'opacity-50': isDisabled
})} />

// Combining multiple approaches
<div className={clsx(
  'px-4 py-2 rounded',
  {
    'bg-blue-500': variant === 'primary',
    'bg-green-500': variant === 'success',
    'bg-red-500': variant === 'danger',
  },
  className // Allow external className prop
)} />
```

## TypeScript Tips

### Component Props
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  children 
}: ButtonProps) {
  return (
    <button 
      className={clsx(
        'rounded font-semibold',
        {
          'bg-blue-500': variant === 'primary',
          'bg-gray-500': variant === 'secondary',
          'bg-red-500': variant === 'danger',
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        }
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### State with TypeScript
```tsx
import { useState } from 'react';

// Simple state
const [count, setCount] = useState<number>(0);

// Object state
interface User {
  id: string;
  email: string;
  name: string;
}

const [user, setUser] = useState<User | null>(null);

// Array state
const [items, setItems] = useState<string[]>([]);
```

## Environment Variables

### Access in Code
```tsx
// Vite environment variables must be prefixed with VITE_
const apiUrl = import.meta.env.VITE_API_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

// Check if running in development
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

## Best Practices

### 1. Component Organization
```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── layouts/        # Layout wrappers
├── hooks/          # Custom React hooks
├── contexts/       # React contexts
├── api/            # API client functions
├── lib/            # Third-party configurations
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

### 2. File Naming
- Components: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- Utilities: camelCase (e.g., `formatDate.ts`, `apiClient.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### 3. Import Order
```tsx
// 1. External libraries
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal components
import { Button } from '../components/Button';
import { Header } from '../components/Header';

// 3. Utilities and helpers
import { formatDate } from '../utils/formatDate';

// 4. Types
import type { User } from '../types/user';

// 5. Styles (if any)
import './styles.css';
```

### 4. Error Handling
```tsx
const [error, setError] = useState<string>('');
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  try {
    setLoading(true);
    setError('');
    
    const { data, error } = await supabase
      .from('table')
      .insert(values);
    
    if (error) throw error;
    
    // Success handling
  } catch (err) {
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```
