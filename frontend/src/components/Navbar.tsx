import { Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <Activity className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">DevWell</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-gray-900 font-medium transition"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
