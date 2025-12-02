import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="relative">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-500 transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">DevWell</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
