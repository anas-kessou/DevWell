import { AppRouter } from './router/index';

/**
 * Main App Component
 * 
 * Architecture:
 * - main.tsx wraps this in QueryClientProvider for TanStack Query
 * - AppRouter handles all routing logic
 * - No longer needs AuthProvider (replaced by TanStack Query hooks)
 */
function App() {
  return <AppRouter />;
}

export default App;
