import { useNavigate } from 'react-router-dom';
import { Camera, TrendingUp, Bell } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Monitor Your Fatigue,
            <span className="text-blue-600"> Boost Your Productivity</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            DevWell uses AI-powered facial recognition to detect signs of fatigue in real-time,
            helping developers maintain peak performance and well-being throughout their workday.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/register')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition transform hover:scale-105"
            >
              Start Monitoring Free
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-blue-600 transition"
            >
              Sign In
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Detection</h3>
              <p className="text-gray-600">
                Advanced AI monitors your webcam feed to detect fatigue signs instantly
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Alerts</h3>
              <p className="text-gray-600">
                Get timely break reminders and motivational tips when fatigue is detected
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Visualize your daily fatigue patterns and optimize your work schedule
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
