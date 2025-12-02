import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';
import type { HealthEvent } from '../types';

interface DashboardGraphProps {
  events: HealthEvent[];
}

interface TimeSeriesPoint {
  timestamp: Date;
  severity: number; // 0-100 based on severity
  type: string;
}

export default function DashboardGraph({ events }: DashboardGraphProps) {
  const [hourlyData, setHourlyData] = useState<{ hour: number; count: number; avgSeverity: number }[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);
  const [stats, setStats] = useState({
    totalAlerts: 0,
    avgSeverity: 0,
    mostActiveHour: 0,
    trend: 'stable' as 'up' | 'down' | 'stable',
  });

  useEffect(() => {
    if (events.length === 0) {
      setHourlyData([]);
      setTimeSeriesData([]);
      setStats({ totalAlerts: 0, avgSeverity: 0, mostActiveHour: 0, trend: 'stable' });
      return;
    }

    // We assume events are augmented with timestamps in the parent or we use current time if missing.
    // Ideally HealthEvent should have a timestamp.
    // For now, we cast to any to access timestamp if it exists, or default to now.
    // But better to define an intersection type in the props if we expect it.
    // The parent Dashboard passes (HealthEvent & { timestamp: Date })[].

    type AugmentedEvent = HealthEvent & { timestamp?: Date };
    const augmentedEvents = events as AugmentedEvent[];

    // Process hourly data
    const hourlyMap = new Map<number, { count: number; totalSeverity: number }>();

    augmentedEvents.forEach(event => {
      const timestamp = event.timestamp || new Date();
      const hour = new Date(timestamp).getHours();

      let severityScore = 0;
      if (event.severity === 'LOW') severityScore = 30;
      if (event.severity === 'MEDIUM') severityScore = 60;
      if (event.severity === 'HIGH') severityScore = 90;

      const existing = hourlyMap.get(hour) || { count: 0, totalSeverity: 0 };
      hourlyMap.set(hour, {
        count: existing.count + 1,
        totalSeverity: existing.totalSeverity + severityScore,
      });
    });

    const hourlyArray = Array.from(hourlyMap.entries()).map(([hour, data]) => ({
      hour,
      count: data.count,
      avgSeverity: data.totalSeverity / data.count,
    })).sort((a, b) => a.hour - b.hour);

    setHourlyData(hourlyArray);

    // Process time series
    const timeSeries = augmentedEvents
      .map(event => {
        let severityScore = 0;
        if (event.severity === 'LOW') severityScore = 30;
        if (event.severity === 'MEDIUM') severityScore = 60;
        if (event.severity === 'HIGH') severityScore = 90;

        return {
          timestamp: event.timestamp || new Date(),
          severity: severityScore,
          type: event.type,
        };
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    setTimeSeriesData(timeSeries);

    // Stats
    const totalAlerts = events.filter(e => e.severity === 'HIGH').length;
    const avgSeverity = hourlyArray.reduce((sum, h) => sum + h.avgSeverity, 0) / (hourlyArray.length || 1);
    const mostActiveHour = hourlyArray.reduce((max, curr) =>
      curr.count > max.count ? curr : max, hourlyArray[0] || { hour: 0 }
    ).hour;

    // Trend
    const half = Math.floor(timeSeries.length / 2);
    const firstHalf = timeSeries.slice(0, half);
    const secondHalf = timeSeries.slice(half);
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.severity, 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.severity, 0) / (secondHalf.length || 1);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (secondAvg > firstAvg + 10) trend = 'up';
    else if (secondAvg < firstAvg - 10) trend = 'down';

    setStats({ totalAlerts, avgSeverity, mostActiveHour, trend });
  }, [events]);

  const maxCount = Math.max(...hourlyData.map(d => d.count), 1);

  // Line graph rendering logic
  const renderLineGraph = () => {
    if (timeSeriesData.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No data yet. Start monitoring to see your event trends.</p>
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

    const scaleY = (severity: number) => {
      return height - padding.bottom - (severity / 100) * graphHeight;
    };

    // Generate path for line
    const linePath = timeSeriesData
      .map((point, index) => {
        const x = scaleX(point.timestamp);
        const y = scaleY(point.severity);
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
                cy={scaleY(point.severity)}
                r="5"
                fill={
                  point.severity >= 80 ? '#ef4444' :
                    point.severity >= 50 ? '#f59e0b' :
                      '#10b981'
                }
                stroke="white"
                strokeWidth="2"
                className="transition-all hover:r-7 cursor-pointer"
              >
                <title>
                  {point.timestamp.toLocaleTimeString()}: {point.type} ({point.severity}%)
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
              className="text-xs fill-gray-600 dark:fill-gray-400"
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
            className="text-sm fill-gray-700 dark:fill-gray-300 font-medium"
          >
            Severity Level
          </text>

          {/* X-axis label */}
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="text-sm fill-gray-700 dark:fill-gray-300 font-medium"
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
            <span className="text-sm text-gray-600">Low Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">High Severity</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-200">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Health Event Analysis</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Events</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{events.length}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">High Severity Alerts</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalAlerts}</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Severity</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgSeverity.toFixed(0)}%</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Peak Activity</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.mostActiveHour}:00</p>
        </div>
      </div>

      {/* Line Graph Section */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Event Trend Over Time
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Real-time visualization of health events and severity
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          {renderLineGraph()}
        </div>
      </div>

      {/* Hourly Bar Chart */}
      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-700 dark:text-gray-200">Hourly Activity</h4>
          <div className="flex items-center gap-2">
            {stats.trend === 'up' && (
              <span className="flex items-center text-red-600 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                Increasing
              </span>
            )}
            {stats.trend === 'down' && (
              <span className="flex items-center text-green-600 text-sm">
                <TrendingDown className="w-4 h-4 mr-1" />
                Decreasing
              </span>
            )}
            {stats.trend === 'stable' && (
              <span className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                <Minus className="w-4 h-4 mr-1" />
                Stable
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {hourlyData.length > 0 ? (
            hourlyData.map(({ hour, count, avgSeverity }) => (
              <div key={hour} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-16">{hour}:00</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${avgSeverity > 70 ? 'bg-red-500' : avgSeverity > 40 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-200">
                    {count} events
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
