'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence, Easing } from 'framer-motion';
import { User, LayoutDashboard, LogOut, Settings, ChevronDown } from 'lucide-react';

interface UserDropdownProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menuItems = [
        {
            label: 'My Profile',
            href: '/dashboard/profile',
            icon: User
        },
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard
        },
    ];

    const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.2, ease: 'easeInOut' as Easing }
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { duration: 0.2, ease: 'easeOut' as Easing }
        },
        exit: {
            opacity: 0,
            y: -10,
            scale: 0.95,
            transition: { duration: 0.15, ease: 'easeIn' as Easing }
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none group"
            >
                <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-transparent group-hover:border-indigo-100 transition-all ring-2 ring-transparent group-hover:ring-indigo-50">
                    <Image
                        className="object-cover"
                        src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=8B5CF6&color=fff`}
                        alt={user.name || 'User'}
                        fill
                        sizes="40px"
                    />
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden origin-top-right"
                    >
                        {/* User Header */}
                        <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2 px-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <item.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Logout */}
                        <div className="py-2 px-2 border-t border-gray-50">
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                            >
                                <LogOut className="mr-3 h-4 w-4 text-red-400 group-hover:text-red-500 transition-colors" />
                                Log out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
