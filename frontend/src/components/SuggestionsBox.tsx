import { Coffee, Eye, Dumbbell, Music, Sun, Wind } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { HealthEvent } from '../types';

interface SuggestionsBoxProps {
  events: HealthEvent[];
  fatigueLevel?: 'rested' | 'tired' | 'alert'; // Optional backward compatibility or override
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

export default function SuggestionsBox({ events, fatigueLevel: propFatigueLevel }: SuggestionsBoxProps) {
  const [quote, setQuote] = useState('');

  // Derive fatigue level from events if not provided explicitly
  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  let derivedLevel: 'rested' | 'tired' | 'alert' = 'rested';

  if (propFatigueLevel) {
    derivedLevel = propFatigueLevel;
  } else if (latestEvent) {
    if (latestEvent.severity === 'HIGH') derivedLevel = 'alert';
    else if (latestEvent.severity === 'MEDIUM') derivedLevel = 'tired';
    else derivedLevel = 'rested';
  }

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, [derivedLevel]);

  const currentSuggestions = suggestions[derivedLevel];
  const bgColor = derivedLevel === 'alert' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
    : derivedLevel === 'tired' ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';

  return (
    <div className={`${bgColor} border-2 rounded-xl p-6 transition-colors duration-200`}>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {derivedLevel === 'alert' ? '⚠️ High Fatigue Alert!'
          : derivedLevel === 'tired' ? '😴 Fatigue Detected'
            : '✨ You\'re Doing Great!'}
      </h3>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 mb-3">Recommendations:</h4>
        <div className="space-y-3">
          {currentSuggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <div key={index} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                <Icon className={`w-6 h-6 ${suggestion.color}`} />
                <span className="text-gray-700 dark:text-gray-200">{suggestion.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-gray-700 dark:text-gray-300 italic">"{quote}"</p>
      </div>

      {derivedLevel !== 'rested' && (
        <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg">
          <h5 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Why breaks matter:</h5>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
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
