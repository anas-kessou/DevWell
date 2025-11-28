import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useLogout, useFatigueMonitor } from '../hooks';
import CameraMonitor from '../components/CameraMonitor';
import DashboardGraph from '../components/DashboardGraph';
import SuggestionsBox from '../components/SuggestionsBox';
import FeedbackForm from '../components/FeedbackForm';
import ChatbotWidget from '../components/ChatbotWidget';
import { Activity, LogOut, User } from 'lucide-react';
import type { FatigueLevel } from '../types';

/**
 * Dashboard Page Component
 * 
 * Features:
 * - Uses TanStack Query hooks for data management
 * - Real-time fatigue monitoring with automatic refetch
 * - Optimistic updates for better UX
 * - No manual state management for server data
 * - Automatic cache invalidation
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { data: user } = useProfile();
  const logoutMutation = useLogout();
  const { logs, refetch: refetchLogs } = useFatigueMonitor();
  
  const [currentFatigueLevel, setCurrentFatigueLevel] = useState<FatigueLevel>('rested');
  const [showAlert, setShowAlert] = useState(false);

  const handleFatigueDetected = (level: FatigueLevel, _confidence: number) => {
    setCurrentFatigueLevel(level);

    if (level === 'alert' || level === 'tired') {
      setShowAlert(true);

      if (Notification.permission === 'granted') {
        new Notification('DevWell Fatigue Alert', {
          body: level === 'alert'
            ? 'High fatigue detected! Please take a break.'
            : 'Fatigue detected. Consider taking a short break.',
          icon: '/vite.svg',
        });
      }

      setTimeout(() => setShowAlert(false), 5000);
    }

    // TanStack Query will automatically refetch
    // But we can manually refetch if needed for instant update
    refetchLogs();
  };

  const handleSignOut = async () => {
    await logoutMutation.mutateAsync();
    navigate('/');
  };

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DevWell</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{user?.username || user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showAlert && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className={`${
            currentFatigueLevel === 'alert' ? 'bg-red-500' : 'bg-orange-500'
          } text-white px-6 py-4 rounded-lg shadow-2xl max-w-sm`}>
            <p className="font-bold text-lg mb-1">
              {currentFatigueLevel === 'alert' ? '⚠️ High Fatigue Alert!' : '😴 Fatigue Detected'}
            </p>
            <p className="text-sm">
              {currentFatigueLevel === 'alert'
                ? 'Take a break immediately!'
                : 'Consider taking a short break soon.'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Monitor your well-being and track your productivity patterns
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <CameraMonitor onFatigueDetected={handleFatigueDetected} />
          </div>

          <div>
            <SuggestionsBox fatigueLevel={currentFatigueLevel} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <DashboardGraph logs={logs} />
          </div>

          <div>
            <FeedbackForm />
          </div>
        </div>
      </div>

      {/* AI Assistant Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
