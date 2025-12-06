import React from 'react';

interface BookingTabsProps {
    activeTab: 'provider' | 'requester';
    onTabChange: (tab: 'provider' | 'requester') => void;
}

export function BookingTabs({ activeTab, onTabChange }: BookingTabsProps) {
    return (
        <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-xl w-fit mb-6">
            <button
                onClick={() => onTabChange('provider')}
                className={`
          px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out
          ${activeTab === 'provider'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }
        `}
            >
                As Provider
            </button>
            <button
                onClick={() => onTabChange('requester')}
                className={`
          px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-out
          ${activeTab === 'requester'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }
        `}
            >
                As Requester
            </button>
        </div>
    );
}
