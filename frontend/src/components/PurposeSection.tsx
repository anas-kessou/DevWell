import { Heart, Brain, Zap, Users } from 'lucide-react';

export default function PurposeSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Purpose
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Developer burnout is real. We're here to help you maintain a healthy
            work-life balance while maximizing your productivity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Health First</h3>
            <p className="text-gray-600">
              Prioritize your physical and mental well-being with timely break reminders
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mental Clarity</h3>
            <p className="text-gray-600">
              Maintain focus and avoid burnout by working at your optimal cognitive state
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Peak Performance</h3>
            <p className="text-gray-600">
              Work smarter by understanding when you're most productive and when to rest
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Community Care</h3>
            <p className="text-gray-600">
              Join thousands of developers who are taking control of their work-life balance
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white p-12 rounded-2xl shadow-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Why Fatigue Monitoring Matters
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Studies show that mental fatigue reduces code quality, increases bugs, and leads
              to longer development cycles. By monitoring your fatigue levels and taking
              strategic breaks, you can:
            </p>
            <ul className="text-left text-gray-600 space-y-3 max-w-2xl mx-auto">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Reduce errors and improve code quality by up to 40%</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Maintain consistent productivity throughout the day</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Prevent long-term burnout and health issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">✓</span>
                <span>Achieve better work-life balance and job satisfaction</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
