import { Coffee, Eye, Dumbbell, Music, Sun, Wind } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SuggestionsBoxProps {
  fatigueLevel: 'rested' | 'tired' | 'alert';
}

const suggestions = {
  alert: [
    { icon: Coffee, text: 'Take a 15-minute break immediately', color: 'text-red-600' },
    { icon: Eye, text: 'Rest your eyes for 5 minutes', color: 'text-red-600' },
    { icon: Dumbbell, text: 'Do light stretching exercises', color: 'text-red-600' },
    { icon: Sun, text: 'Step outside for fresh air', color: 'text-red-600' },
  ],
  tired: [
    { icon: Coffee, text: 'Consider a short coffee break', color: 'text-orange-600' },
    { icon: Eye, text: 'Follow the 20-20-20 rule', color: 'text-orange-600' },
    { icon: Music, text: 'Listen to energizing music', color: 'text-orange-600' },
    { icon: Wind, text: 'Take deep breaths for 2 minutes', color: 'text-orange-600' },
  ],
  rested: [
    { icon: Coffee, text: 'Keep up the great work!', color: 'text-green-600' },
    { icon: Eye, text: 'Stay hydrated', color: 'text-green-600' },
    { icon: Sun, text: 'Maintain good posture', color: 'text-green-600' },
  ],
};

const motivationalQuotes = [
  "Your health is your wealth. Take breaks regularly!",
  "A rested mind is a productive mind.",
  "Small breaks lead to big breakthroughs.",
  "Taking care of yourself is productive.",
  "Quality over quantity. Rest when needed.",
  "Your future self will thank you for resting now.",
];

export default function SuggestionsBox({ fatigueLevel }: SuggestionsBoxProps) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [fatigueLevel]);

  const currentSuggestions = suggestions[fatigueLevel];
  const bgColor = fatigueLevel === 'alert' ? 'bg-red-50 border-red-200'
    : fatigueLevel === 'tired' ? 'bg-orange-50 border-orange-200'
    : 'bg-green-50 border-green-200';

  return (
    <div className={`${bgColor} border-2 rounded-xl p-6`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        {fatigueLevel === 'alert' ? '⚠️ High Fatigue Alert!'
          : fatigueLevel === 'tired' ? '😴 Fatigue Detected'
          : '✨ You\'re Doing Great!'}
      </h3>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Recommendations:</h4>
        <div className="space-y-3">
          {currentSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                <Icon className={`w-6 h-6 ${suggestion.color}`} />
                <span className="text-gray-700">{suggestion.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-gray-700 italic">"{quote}"</p>
      </div>

      {fatigueLevel !== 'rested' && (
        <div className="mt-4 bg-white p-4 rounded-lg">
          <h5 className="font-semibold text-gray-700 mb-2">Why breaks matter:</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Improve focus and concentration</li>
            <li>• Reduce eye strain and physical discomfort</li>
            <li>• Boost creativity and problem-solving</li>
            <li>• Prevent burnout and maintain long-term productivity</li>
          </ul>
        </div>
      )}
    </div>
  );
}
