import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, useLogout, useDarkMode } from '../hooks';
import { useGeminiLive } from '../hooks/useGeminiLive';
import CameraMonitor from '../components/CameraMonitor';
import DashboardGraph from '../components/DashboardGraph';
import SuggestionsBox from '../components/SuggestionsBox';
import FeedbackForm from '../components/FeedbackForm';
import ChatbotWidget from '../components/ChatbotWidget';
import LibraryWidget from '../components/LibraryWidget';
import { Activity, LogOut, User, Play, Square, Monitor, MonitorOff, Moon, Sun, ChevronDown, Code, Mail } from 'lucide-react';
import type { LogEntry, HealthEvent } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: user } = useProfile();
  const logoutMutation = useLogout();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [events, setEvents] = useState<(HealthEvent & { timestamp: Date })[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLog = (entry: LogEntry) => {
    setLogs(prev => [...prev, entry]);
  };

  const handleHealthEvent = (event: HealthEvent) => {
    setEvents(prev => [...prev, { ...event, timestamp: new Date() }]);

    // Show notification
    if (event.severity === 'HIGH' && Notification.permission === 'granted') {
      new Notification('DevWell Alert', {
        body: event.description,
        icon: '/vite.svg'
      });
    }
  };

  const {
    connect,
    disconnect,
    startScreenShare,
    stopScreenShare,
    sendTextMessage,
    isConnected,
    isStreaming,
    isScreenSharing,
    videoRef,
    canvasRef,
    cameraStream
  } = useGeminiLive({
    onLog: handleLog,
    onHealthEvent: handleHealthEvent
  });

  const geminiApiKey = (import.meta.env.VITE_API_KEY ?? '').trim();
  const isGeminiKeyConfigured = geminiApiKey.length > 0;

  const handleStartStopSession = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else if (isGeminiKeyConfigured) {
      connect();
    }
  }, [connect, disconnect, isConnected, isGeminiKeyConfigured]);

  const handleSignOut = async () => {
    if (isConnected) disconnect();
    await logoutMutation.mutateAsync();
    navigate('/');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Dark Mode: Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
      // Start/Stop Session: Ctrl/Cmd + Shift + S
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        if (!isConnected && !isGeminiKeyConfigured) {
          return;
        }
        handleStartStopSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isConnected, handleStartStopSession, isGeminiKeyConfigured, toggleDarkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">DevWell</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span>Profile</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>

                    {/* Developer Info */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-2 mb-1">
                        <Code className="w-4 h-4 text-blue-500" />
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                          Developer
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Anas KESSOU</p>
                      <a
                        href="mailto:contact@anaskessou.dev"
                        className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                      >
                        <Mail className="w-3 h-3" />
                        Contact Developer
                      </a>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Monitor your well-being and track your productivity patterns
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isConnected ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStartStopSession}
                  disabled={!isGeminiKeyConfigured}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Play size={20} fill="currentColor" />
                  {isGeminiKeyConfigured ? 'Start Session' : 'Add Gemini API Key'}
                </button>
                {!isGeminiKeyConfigured && (
                  <p className="text-xs text-rose-500">
                    Gemini API key missing. Set <code>VITE_API_KEY</code> in <code>frontend/.env</code> or run <code>./add-api-key.sh YOUR_KEY</code> to enable live sessions.
                  </p>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  className={`flex items-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all shadow-lg ${isScreenSharing
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  {isScreenSharing ? <MonitorOff size={20} /> : <Monitor size={20} />}
                  {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                </button>

                <button
                  onClick={disconnect}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-red-900/20"
                >
                  <Square size={20} fill="currentColor" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 mb-8">
          {/* Main Monitor - 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-1 overflow-hidden">
              <CameraMonitor
                videoRef={videoRef}
                isStreaming={isStreaming}
                isScreenSharing={isScreenSharing}
                cameraStream={cameraStream}
              />
              <canvas ref={canvasRef} className="hidden" aria-hidden />
            </div>
            <DashboardGraph events={events} />
          </div>

          {/* Side Panel - 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <SuggestionsBox events={events} />
            <FeedbackForm />
          </div>
        </div>
      </div>

      {/* AI Assistant Chatbot */}
      {/* We pass logs to it if we want it to show history, but the widget manages its own state mostly. 
          Ideally we should sync them. For now, let's leave it as is or pass logs if supported.
          The current ChatbotWidget uses useSendMessage hook. 
          To link it with Gemini Live, we might need to update ChatbotWidget to accept external messages/logs.
          But for this task, the requirement is "linked with the chat ai agent".
          The useGeminiLive hook handles the AI agent interaction (audio).
          The ChatbotWidget is text-based.
          If we want to show the live transcript in the widget, we would need to pass 'logs' to it.
      */}
      <LibraryWidget />
      <ChatbotWidget
        logs={logs}
        onSendMessage={sendTextMessage}
        isConnected={isConnected}
      />
    </div>
  );
}
