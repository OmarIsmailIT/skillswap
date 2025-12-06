'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { CreditsChart } from '@/components/dashboard/CreditsChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';

interface DashboardData {
  credits: {
    available: number;
    reserved: number;
    total: number;
  };
  bookings: {
    active: number;
    upcoming: number;
    total: number;
  };
  skills: {
    listed: number;
    topPerforming: Array<{
      title: string;
      category: string;
      avgRating: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    type: 'sent' | 'received';
    amount: number;
    from: string;
    to: string;
    date: string;
  }>;
  upcomingBookings: Array<{
    id: string;
    skill: string;
    with: string;
    date: string;
    role: string;
  }>;
  creditHistory: Array<{
    date: string;
    credits: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
          <svg className="mx-auto h-12 w-12 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-900 mb-2">{error}</h3>
          <p className="text-sm text-red-700">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your skills.</p>
        </div>
        <Link href="/offers/create">
          <Button className="mt-4 md:mt-0 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Offer
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Available Credits"
          value={data.credits.available}
          subtitle={`${data.credits.reserved} reserved`}
          gradient="from-purple-500 to-purple-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatsCard
          title="Active Bookings"
          value={data.bookings.active}
          subtitle="In progress"
          gradient="from-green-500 to-green-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatsCard
          title="Skills Listed"
          value={data.skills.listed}
          subtitle="Your offerings"
          gradient="from-blue-500 to-blue-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />

        <StatsCard
          title="Total Transactions"
          value={data.bookings.total}
          subtitle="All time"
          gradient="from-pink-500 to-pink-700"
          icon={
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credits Chart - 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Credit History</h2>
                <p className="text-sm text-gray-500 mt-1">Track your balance over time</p>
              </div>
              <Link href="/dashboard/credits" className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
                View Details →
              </Link>
            </div>
            {data.creditHistory.length > 0 ? (
              <CreditsChart data={data.creditHistory} height={250} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm">No credit history yet</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - 1 column */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/offers/create" className="block">
              <button className="w-full flex items-center gap-3 p-4 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all group">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Create Offer</p>
                  <p className="text-xs text-gray-500">Share your skills</p>
                </div>
              </button>
            </Link>

            <Link href="/skills" className="block">
              <button className="w-full flex items-center gap-3 p-4 bg-white hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-300 transition-all group">
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Browse Skills</p>
                  <p className="text-xs text-gray-500">Find new teachers</p>
                </div>
              </button>
            </Link>

            <Link href="/dashboard/listings" className="block">
              <button className="w-full flex items-center gap-3 p-4 bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Manage Listings</p>
                  <p className="text-xs text-gray-500">Edit your offers</p>
                </div>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-500 mt-1">Latest credit transactions</p>
            </div>
            <Link href="/dashboard/credits" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              View All →
            </Link>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <ActivityFeed activities={data.recentActivity.slice(0, 5)} />
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
              <p className="text-sm text-gray-500 mt-1">Your next {data.upcomingBookings.length} bookings</p>
            </div>
            <Link href="/dashboard/bookings" className="text-sm font-medium text-purple-600 hover:text-purple-700">
              View All →
            </Link>
          </div>
          {/* ✅ FIX: Added max-h and overflow-y-auto for scrolling */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {data.upcomingBookings.length > 0 ? (
              data.upcomingBookings.map((booking) => {
                const date = new Date(booking.date);
                const isProvider = booking.role === 'provider';

                return (
                  <div key={booking.id} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{booking.skill}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {isProvider ? 'Teaching' : 'Learning from'} <span className="font-medium">{booking.with}</span>
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isProvider ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {isProvider ? 'Provider' : 'Learner'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No upcoming sessions</p>
                <Link href="/skills">
                  <Button variant="outline" className="mt-3">
                    Browse Skills
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Skills Performance */}
      {data.skills.topPerforming.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Skills</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.skills.topPerforming.map((skill, index) => (
              <div key={index} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{skill.title}</h3>
                  <span className="flex items-center gap-1 text-yellow-600">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="font-bold">{skill.avgRating?.toFixed(1) || 'N/A'}</span>
                  </span>
                </div>
                <p className="text-sm text-gray-600">{skill.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
