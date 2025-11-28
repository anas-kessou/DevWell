import { Shield, Clock, LineChart } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            About DevWell
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We built DevWell to help developers maintain their health and productivity
            in an increasingly demanding work environment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              AI-Powered Fatigue Detection
            </h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Using advanced machine learning models trained on facial recognition data,
              DevWell can accurately detect signs of tiredness, eye strain, and mental fatigue
              in real-time as you work.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our system analyzes facial features, eye movements, and posture to provide
              accurate fatigue assessments without storing any video data.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-slate-100 p-8 rounded-2xl">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Privacy First</h4>
                  <p className="text-gray-600 text-sm">
                    All processing happens locally. No video data is stored or transmitted.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Real-Time Monitoring</h4>
                  <p className="text-gray-600 text-sm">
                    Instant fatigue detection with immediate break suggestions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-600 p-3 rounded-lg">
                  <LineChart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">Insights & Analytics</h4>
                  <p className="text-gray-600 text-sm">
                    Track patterns and optimize your work schedule for peak performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
