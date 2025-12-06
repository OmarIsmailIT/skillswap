'use client';

import { useEffect, useState, useCallback } from 'react';
import { Star, Inbox, Edit3, ChevronRight, User as UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer?: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  provider?: {
    _id: string;
    name: string;
  };
  skillOffer?: {
    _id: string;
    title: string;
  };
}

interface ReceivedReviewsData {
  success: boolean;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

interface WrittenReviewsData {
  success: boolean;
  reviews: Review[];
  totalReviews: number;
}

export default function MyReviewsPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'received' | 'written'>('received');
  const [receivedReviews, setReceivedReviews] = useState<Review[]>([]);
  const [writtenReviews, setWrittenReviews] = useState<Review[]>([]);
  const [receivedStats, setReceivedStats] = useState({ avgRating: 0, total: 0 });
  const [writtenTotal, setWrittenTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all reviews on load
  const fetchReviews = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [receivedRes, writtenRes] = await Promise.all([
        fetch(`/api/reviews/user/${session.user.id}`),
        fetch('/api/reviews/written')
      ]);

      if (receivedRes.ok) {
        const data: ReceivedReviewsData = await receivedRes.json();
        setReceivedReviews(data.reviews || []);
        setReceivedStats({
          avgRating: data.averageRating || 0,
          total: data.totalReviews || 0
        });
      }

      if (writtenRes.ok) {
        const data: WrittenReviewsData = await writtenRes.json();
        setWrittenReviews(data.reviews || []);
        setWrittenTotal(data.totalReviews || 0);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchReviews();
    }
  }, [status, fetchReviews]);

  const currentReviews = activeTab === 'received' ? receivedReviews : writtenReviews;

  // Show loading during authentication
  if (status === 'loading') {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // Show login message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Please log in</h3>
        <p className="text-sm text-gray-500">You need to be logged in to view your reviews.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-600 mt-1">Manage and view your reviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating Card */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg border border-yellow-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
              <Star className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Avg Rating</p>
              <h3 className="text-3xl font-bold text-gray-900">{receivedStats.avgRating.toFixed(1)}</h3>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.round(receivedStats.avgRating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 fill-gray-300'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Received Reviews Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Inbox className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Received</p>
              <h3 className="text-3xl font-bold text-gray-900">{receivedStats.total}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600">Reviews from students</p>
        </div>

        {/* Written Reviews Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Edit3 className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">Written</p>
              <h3 className="text-3xl font-bold text-gray-900">{writtenTotal}</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600">Reviews you gave</p>
        </div>
      </div>

      {/* Tabs + Reviews List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-50 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('received')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200
              ${activeTab === 'received'
                ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <Inbox className="w-4 h-4" />
            Received Reviews
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${activeTab === 'received' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}
            `}>
              {receivedStats.total}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('written')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200
              ${activeTab === 'written'
                ? 'bg-white text-gray-900 shadow-md ring-1 ring-black/5'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <Edit3 className="w-4 h-4" />
            Written Reviews
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold
              ${activeTab === 'written' ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-600'}
            `}>
              {writtenTotal}
            </span>
          </button>
        </div>

        {/* Reviews Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
            </div>
          ) : currentReviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 rounded-full bg-gray-100 mb-4">
                {activeTab === 'received' ? (
                  <Inbox className="w-8 h-8 text-gray-400" />
                ) : (
                  <Edit3 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {activeTab === 'received'
                  ? "Reviews from your students will appear here once they complete sessions."
                  : "Your reviews for providers will appear here after you complete sessions."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 max-h-[700px] overflow-y-auto pr-2" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#d1d5db #f3f4f6'
            }}>
              {currentReviews.map((review) => {
                const isReceived = activeTab === 'received';
                const displayUser = isReceived ? review.reviewer : review.provider;

                return (
                  <div
                    key={review._id}
                    className={`
                      relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg
                      ${isReceived
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300'
                        : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300'
                      }
                    `}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className={`
                            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg
                            ${isReceived
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                              : 'bg-gradient-to-br from-purple-400 to-pink-500'
                            }
                          `}>
                            {displayUser?.name?.charAt(0) || 'U'}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {displayUser?.name || 'Anonymous'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-0.5">
                              <UserIcon className="w-3 h-3" />
                              <span className="truncate">
                                {isReceived ? 'Reviewed your skill' : 'You reviewed'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Rating Badge */}
                        <div className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 bg-yellow-100 rounded-full">
                          <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                          <span className="text-sm font-bold text-yellow-900">{review.rating}</span>
                        </div>
                      </div>

                      {/* Skill Offer Title */}
                      {review.skillOffer && (
                        <div className="mb-3 px-3 py-2 bg-white/60 rounded-lg border border-gray-200/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                              <span className="text-sm font-medium text-gray-900">
                                {review.skillOffer.title}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      )}

                      {/* Review Comment */}
                      <div className="relative">
                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                        <p className="text-gray-700 pl-4 italic leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
