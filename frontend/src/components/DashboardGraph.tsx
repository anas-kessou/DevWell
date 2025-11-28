import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import type { FatigueLog } from '../types';

/**
 * DashboardGraph Component
 * 
 * Displays fatigue detection statistics and trends with:
 * - Statistical cards
 * - Hourly bar chart
 * - Real-time line graph showing fatigue trends over time
 * Works with new FatigueLog type from backend
 */

interface DashboardGraphProps {
  logs: FatigueLog[];
}

interface TimeSeriesPoint {
  timestamp: Date;
  confidence: number;
  status: 'alert' | 'tired' | 'rested';
}

export default function DashboardGraph({ logs }: DashboardGraphProps) {
  const [hourlyData, setHourlyData] = useState<{ hour: number; count: number; avgConfidence: number }[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    avgConfidence: 0,
    mostFatiguedHour: 0,
    trend: 'stable' as 'up' | 'down' | 'stable',
  });

  useEffect(() => {
    if (logs.length === 0) return;

    // Process hourly data for bar chart
    const hourlyMap = new Map<number, { count: number; totalConfidence: number }>();

    logs.forEach(log => {
      // Use createdAt or capturedAt for timestamp
      const timestamp = log.capturedAt || log.createdAt;
      const hour = new Date(timestamp).getHours();
      const existing = hourlyMap.get(hour) || { count: 0, totalConfidence: 0 };
      hourlyMap.set(hour, {
        count: existing.count + 1,
        totalConfidence: existing.totalConfidence + log.confidence,
      });
    });

    const hourlyArray = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
      hour,
      count: data.count,
      avgConfidence: data.totalConfidence / data.count,
    })).sort((a, b) => a.hour - b.hour);

    setHourlyData(hourlyArray);

    // Process time series data for line graph
    const timeSeries = logs
      .map(log => ({
        timestamp: new Date(log.capturedAt || log.createdAt),
        confidence: log.confidence,
        status: log.status,
      }))
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    setTimeSeriesData(timeSeries);

    // Calculate statistics
    // Use 'status' instead of 'fatigue_level' (new backend schema)
    const totalAlerts = logs.filter(log => log.status === 'tired' || log.status === 'alert').length;
    const avgConfidence = logs.reduce((sum, log) => sum + log.confidence, 0) / logs.length;
    const mostFatiguedHour = hourlyArray.reduce((max, curr) =>
      curr.count > max.count ? curr : max, hourlyArray[0] || { hour: 0 }
    ).hour;

    const firstHalf = logs.slice(0, Math.floor(logs.length / 2));
    const secondHalf = logs.slice(Math.floor(logs.length / 2));
    const firstAvg = firstHalf.reduce((sum, log) => sum + log.confidence, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, log) => sum + log.confidence, 0) / secondHalf.length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 5) trend = 'up';
    else if (secondAvg < firstAvg - 5) trend = 'down';

    setStats({ totalAlerts, avgConfidence, mostFatiguedHour, trend });
  }, [logs]);

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  // Line graph rendering logic
  const renderLineGraph = () => {
    if (timeSeriesData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No data yet. Start monitoring to see your fatigue trends.</p>
        </div>
      );
    }

    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    // Get time range
    const minTime = timeSeriesData[0].timestamp.getTime();
    const maxTime = timeSeriesData[timeSeriesData.length - 1].timestamp.getTime();
    const timeRange = maxTime - minTime || 1;

    // Scale functions
    const scaleX = (timestamp: Date) => {
      return padding.left + ((timestamp.getTime() - minTime) / timeRange) * graphWidth;
    };

    const scaleY = (confidence: number) => {
      return height - padding.bottom - (confidence / 100) * graphHeight;
    };

    // Generate path for line
    const linePath = timeSeriesData
      .map((point, index) => {
        const x = scaleX(point.timestamp);
        const y = scaleY(point.confidence);
        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Generate area path (fill under line)
    const areaPath = `
      ${linePath}
      L ${scaleX(timeSeriesData[timeSeriesData.length - 1].timestamp)} ${height - padding.bottom}
      L ${scaleX(timeSeriesData[0].timestamp)} ${height - padding.bottom}
      Z
    `;

    // Y-axis labels
    const yLabels = [0, 25, 50, 75, 100];

    // X-axis labels (time)
    const xLabelCount = 5;
    const xLabels = Array.from({ length: xLabelCount }, (_, i) => {
      const time = minTime + (timeRange * i) / (xLabelCount - 1);
      return new Date(time);
    });

    return (
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Grid lines */}
          {yLabels.map(label => (
            <g key={label}>
              <line
                x1={padding.left}
                y1={scaleY(label)}
                x2={width - padding.right}
                y2={scaleY(label)}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={scaleY(label) + 5}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {label}%
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {timeSeriesData.map((point, index) => (
            <g key={index}>
              <circle
                cx={scaleX(point.timestamp)}
                cy={scaleY(point.confidence)}
                r="5"
                fill={
                  point.status === 'alert' ? '#ef4444' :
                  point.status === 'tired' ? '#f59e0b' :
                  '#10b981'
                }
                stroke="white"
                strokeWidth="2"
                className="transition-all hover:r-7 cursor-pointer"
              >
                <title>
                  {point.timestamp.toLocaleTimeString()}: {point.confidence.toFixed(1)}% ({point.status})
                </title>
              </circle>
            </g>
          ))}

          {/* X-axis labels */}
          {xLabels.map((time, index) => (
            <text
              key={index}
              x={scaleX(time)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </text>
          ))}

          {/* Y-axis label */}
          <text
            x={padding.left - 35}
            y={height / 2}
            textAnchor="middle"
            transform={`rotate(-90, ${padding.left - 35}, ${height / 2})`}
            className="text-sm fill-gray-700 font-medium"
          >
            Fatigue Confidence (%)
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            Time
          </text>

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Rested</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Tired</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Alert</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Today's Fatigue Analysis</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Checks</p>
          <p className="text-2xl font-bold text-blue-600">{logs.length}</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Fatigue Alerts</p>
          <p className="text-2xl font-bold text-orange-600">{stats.totalAlerts}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-green-600">{stats.avgConfidence.toFixed(0)}%</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Peak Fatigue</p>
          <p className="text-2xl font-bold text-purple-600">{stats.mostFatiguedHour}:00</p>
        </div>
      </div>

      {/* Line Graph Section */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Fatigue Trend Over Time
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              Real-time visualization of fatigue confidence levels throughout the day
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          {renderLineGraph()}
        </div>
      </div>

      {/* Existing Hourly Bar Chart */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-700">Hourly Activity</h4>
          <div className="flex items-center gap-2">
            {stats.trend === 'up' && (
              <span className="flex items-center text-red-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Fatigue Increasing
              </span>
            )}
            {stats.trend === 'down' && (
              <span className="flex items-center text-green-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                Fatigue Decreasing
              </span>
            )}
            {stats.trend === 'stable' && (
              <span className="flex items-center text-gray-600 text-sm">
                <Minus className="w-4 h-4 mr-1" />
                Stable
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {hourlyData.length > 0 ? (
            hourlyData.map(({ hour, count, avgConfidence }) => (
              <div key={hour} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">{hour}:00</span>
                <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      avgConfidence > 70 ? 'bg-red-500' : avgConfidence > 50 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                    {count} checks
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data yet. Start monitoring to see your fatigue patterns.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
