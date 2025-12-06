'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    credits: { current: number; reserved: number } | null;
    refreshCredits: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    credits: null,
    refreshCredits: async () => { },
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
    const { data: session, status } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [credits, setCredits] = useState<{ current: number; reserved: number } | null>(null);

    // Fetch credits from API
    const fetchCredits = useCallback(async () => {
        if (!session?.user?.id) return;

        try {
            const res = await fetch('/api/credits/me');
            if (res.ok) {
                const data = await res.json();
                setCredits({
                    current: data.credits.current || 0,
                    reserved: data.credits.reserved || 0,
                });
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        }
    }, [session?.user?.id]);

    // Initialize socket connection
    useEffect(() => {
        if (status !== 'authenticated' || !session?.user?.id) {
            return;
        }

        const socketInstance = io('http://localhost:3000', {
            path: '/api/socketio',
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketInstance.on('connect', () => {

            setIsConnected(true);

            // Authenticate user with socket
            socketInstance.emit('authenticate', session.user.id);

            // Fetch initial credits
            fetchCredits();
        });

        socketInstance.on('disconnect', () => {

            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        // Listen for credit updates
        socketInstance.on('credit-updated', (updatedCredits: { current: number; reserved: number }) => {

            setCredits(updatedCredits);
        });

        // Listen for booking updates
        socketInstance.on('booking-updated', (booking: any) => {

            // You can dispatch custom events or update global state here
            window.dispatchEvent(new CustomEvent('booking-updated', { detail: booking }));
        });

        // Listen for notifications
        socketInstance.on('notification', (notification: any) => {

            // You can show toast notifications here
            window.dispatchEvent(new CustomEvent('notification', { detail: notification }));
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [session?.user?.id, status]); // ✅ Removed fetchCredits from deps - it's stable via useCallback

    const refreshCredits = useCallback(async () => {
        await fetchCredits();
    }, [fetchCredits]);

    return (
        <SocketContext.Provider value={{ socket, isConnected, credits, refreshCredits }}>
            {children}
        </SocketContext.Provider>
    );
}

// Custom hook for listening to specific socket events
export function useSocketEvent<T>(event: string, handler: (data: T) => void) {
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;

        socket.on(event, handler);

        return () => {
            socket.off(event, handler);
        };
    }, [socket, event, handler]);
}
