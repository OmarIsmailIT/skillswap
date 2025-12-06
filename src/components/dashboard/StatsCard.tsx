'use client';

interface StatsCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    gradient: string;
    trend?: {
        value: string;
        positive: boolean;
    };
}

export const StatsCard = ({ title, value, subtitle, icon, gradient, trend }: StatsCardProps) => {
    return (
        <div className={`relative overflow-hidden rounded-2xl shadow-lg bg-gradient-to-br ${gradient} p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-white/5"></div>

            <div className="relative">
                {/* Icon */}
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        {icon}
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${trend.positive ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'
                            }`}>
                            <span>{trend.positive ? '↑' : '↓'}</span>
                            <span>{trend.value}</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>

                {/* Value */}
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-white">{value}</p>
                </div>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-white/60 text-xs mt-2">{subtitle}</p>
                )}
            </div>
        </div>
    );
};
