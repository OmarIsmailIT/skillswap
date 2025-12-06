'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState } from 'react';

interface DataPoint {
    date: string;
    credits: number;
}

interface CreditsChartProps {
    data: DataPoint[];
    height?: number;
}

export const CreditsChart = ({ data, height = 250 }: CreditsChartProps) => {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400">
                <p>No data available</p>
            </div>
        );
    }

    const maxCredits = Math.max(...data.map(d => d.credits), 1);
    const minCredits = Math.min(...data.map(d => d.credits), 0);
    const range = maxCredits - minCredits || 1;
    const padding = 20;
    const chartHeight = height - padding * 2;
    const chartWidth = 100;
    const pointWidth = chartWidth / (data.length - 1 || 1);

    // Calculate trend
    const firstValue = data[0]?.credits || 0;
    const lastValue = data[data.length - 1]?.credits || 0;
    const percentChange = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
    const trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';

    // Generate SVG path
    const points = data.map((d, i) => {
        const x = i * pointWidth;
        const y = chartHeight - ((d.credits - minCredits) / range) * chartHeight + padding;
        return { x, y, credits: d.credits, date: d.date };
    });

    const pathD = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    // Area fill path
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

    // Format date for display
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                {/* Starting Balance */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Starting</p>
                    <p className="text-2xl font-bold text-blue-900">{firstValue}</p>
                    <p className="text-xs text-blue-600 mt-1">{formatDate(data[0].date)}</p>
                </div>

                {/* Current Balance */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200">
                    <p className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1">Current</p>
                    <p className="text-2xl font-bold text-purple-900">{lastValue}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-600" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-600" />}
                        {trend === 'neutral' && <Minus className="w-3 h-3 text-gray-500" />}
                        <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' :
                                trend === 'down' ? 'text-red-600' :
                                    'text-gray-500'
                            }`}>
                            {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Change */}
                <div className={`p-4 rounded-xl border ${trend === 'up'
                        ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
                        : trend === 'down'
                            ? 'bg-gradient-to-br from-red-50 to-red-100/50 border-red-200'
                            : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200'
                    }`}>
                    <p className={`text-xs font-medium uppercase tracking-wider mb-1 ${trend === 'up' ? 'text-green-600' :
                            trend === 'down' ? 'text-red-600' :
                                'text-gray-600'
                        }`}>Change</p>
                    <p className={`text-2xl font-bold ${trend === 'up' ? 'text-green-900' :
                            trend === 'down' ? 'text-red-900' :
                                'text-gray-900'
                        }`}>
                        {lastValue - firstValue > 0 ? '+' : ''}{lastValue - firstValue}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
                </div>
            </div>

            {/* Chart */}
            <div className="relative w-full bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                {/* Hovered Point Info */}
                {hoveredPoint !== null && (
                    <div className="absolute top-4 right-4 bg-white shadow-lg border border-gray-200 rounded-lg px-4 py-2.5 z-10">
                        <p className="text-xs text-gray-500 mb-1">{formatDate(points[hoveredPoint].date)}</p>
                        <p className="text-lg font-bold text-purple-600">{points[hoveredPoint].credits} credits</p>
                    </div>
                )}

                <div className="relative pl-10">
                    <svg
                        viewBox={`0 0 ${chartWidth} ${height}`}
                        preserveAspectRatio="none"
                        className="w-full"
                        style={{ height: `${height}px` }}
                    >
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(percent => {
                            const y = height - (percent / 100) * chartHeight;
                            return (
                                <g key={percent}>
                                    <line
                                        x1="0"
                                        y1={y}
                                        x2={chartWidth}
                                        y2={y}
                                        stroke="#e5e7eb"
                                        strokeWidth="0.5"
                                        strokeDasharray="3,3"
                                    />
                                </g>
                            );
                        })}

                        {/* Area gradient */}
                        <defs>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.05" />
                            </linearGradient>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>

                        {/* Area */}
                        <path d={areaD} fill="url(#areaGradient)" />

                        {/* Line */}
                        <path
                            d={pathD}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Points */}
                        {points.map((p, i) => (
                            <g key={i}>
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredPoint === i ? "5" : "4"}
                                    fill={hoveredPoint === i ? "#ec4899" : "#8b5cf6"}
                                    stroke="white"
                                    strokeWidth="2.5"
                                    className="transition-all cursor-pointer drop-shadow-md"
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            </g>
                        ))}
                    </svg>

                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-medium text-gray-600" style={{ marginLeft: '-40px' }}>
                        <span>{Math.round(maxCredits)}</span>
                        <span>{Math.round((maxCredits + minCredits) / 2)}</span>
                        <span>{Math.round(minCredits)}</span>
                    </div>
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between mt-3 px-10 text-xs font-medium text-gray-500">
                    <span>{formatDate(data[0].date)}</span>
                    {data.length > 2 && (
                        <span>{formatDate(data[Math.floor(data.length / 2)].date)}</span>
                    )}
                    <span>{formatDate(data[data.length - 1].date)}</span>
                </div>
            </div>
        </div>
    );
};
