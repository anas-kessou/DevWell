import { useNavigate } from 'react-router-dom';
import { Camera, TrendingUp, ArrowRight, Zap } from 'lucide-react';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]"></div>
      <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-purple-500 opacity-20 blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now with Live AI Assistant
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight leading-tight animate-fade-in-up delay-100">
            Code Smarter, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              Stay Healthy
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
            DevWell uses advanced AI to monitor your well-being in real-time, preventing burnout before it happens. Your personal health companion for marathon coding sessions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in-up delay-300">
            <button
              onClick={() => navigate('/register')}
              className="group bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Start Monitoring Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              Sign In
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 animate-fade-in-up delay-300">
            {[
              {
                icon: <Camera className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
                title: "Real-Time Detection",
                desc: "Advanced computer vision monitors fatigue signs instantly via webcam.",
                color: "bg-blue-100 dark:bg-blue-900/30"
              },
              {
                icon: <Zap className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />,
                title: "Smart Alerts",
                desc: "Get timely, intelligent break reminders when your focus drops.",
                color: "bg-yellow-100 dark:bg-yellow-900/30"
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
                title: "Productivity Analytics",
                desc: "Visualize your energy levels and optimize your coding schedule.",
                color: "bg-purple-100 dark:bg-purple-900/30"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:-translate-y-2">
                <div className={`${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
