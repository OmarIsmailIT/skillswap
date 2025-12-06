'use client';

import { useSocket } from '@/contexts/SocketContext';
import { Wallet } from 'lucide-react';

export const CreditsCounter = () => {
  const { credits, isConnected } = useSocket();

  if (credits === null) {
    return (
      <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse"></div>
    );
  }

  return (
    <div className="relative flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-3 py-2 shadow-sm hover:shadow-md transition-all">
      {/* Connection Indicator */}
      <div className="relative">
        <Wallet className="w-4 h-4 text-green-700" />
        <div
          className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-semibold text-green-700 leading-none">
          {credits.current}
        </span>
        {credits.reserved > 0 && (
          <span className="text-[10px] text-green-600 leading-none mt-0.5">
            ({credits.reserved} reserved)
          </span>
        )}
      </div>
    </div>
  );
};
