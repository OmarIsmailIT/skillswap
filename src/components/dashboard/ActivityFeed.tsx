'use client';

interface Activity {
    id: string;
    type: 'sent' | 'received';
    amount: number;
    from: string;
    to: string;
    date: string;
}

interface ActivityFeedProps {
    activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, index) => {
                const isReceived = activity.type === 'received';
                const date = new Date(activity.date);
                const timeAgo = getTimeAgo(date);

                return (
                    <div key={activity.id} className="flex items-start gap-3 group">
                        {/* Timeline */}
                        <div className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isReceived ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'
                                } group-hover:scale-110 transition-transform`}>
                                {isReceived ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                )}
                            </div>
                            {index < activities.length - 1 && (
                                <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {isReceived ? (
                                            <>
                                                <span className="text-green-600">Received</span> {activity.amount} credits
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-purple-600">Sent</span> {activity.amount} credits
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {isReceived ? `From ${activity.from}` : `To ${activity.to}`}
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">{timeAgo}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
