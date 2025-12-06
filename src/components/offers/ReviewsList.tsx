'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  comment: string;
  rating: number;
  reviewer: {
    _id: string;
    name: string;
  };
}

interface ReviewsListProps {
  skillOfferId: string;
  initialRating?: number;
  initialCount?: number;
}

export const ReviewsList = ({ skillOfferId, initialRating = 0, initialCount = 0 }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/skilloffer/${skillOfferId}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          // Update stats from fresh data if available
          if (data.averageRating !== undefined) setRating(data.averageRating);
          if (data.totalReviews !== undefined) setCount(data.totalReviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [skillOfferId]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Reviews</h3>

      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl font-bold text-gray-900">
          {rating.toFixed(1)}
        </div>
        <div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-5 w-5 ${i < Math.round(rating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300 fill-current'
                  }`}
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {count} reviews
          </div>
        </div>
      </div>

      {/* ✅ Scrollable reviews list with custom scrollbar */}
      <div
        className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6'
        }}
      >
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-purple-600 rounded-full border-t-transparent"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div
              key={review._id}
              className={`pt-4 ${index > 0 ? 'border-t border-gray-100' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                  {review.reviewer?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h5 className="font-semibold text-gray-900 text-sm">{review.reviewer?.name || 'Anonymous'}</h5>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3 w-3 ${i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-200 fill-current'
                            }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4 text-sm">No reviews yet.</p>
        )}
      </div>
    </div>
  );
};
