'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { slideUp } from '@/lib/motion';

interface SkillOffer {
  _id: string;
  title: string;
  description: string;
  category: string;
  costCredits: number;
  durationMinutes: number;
  owner: {
    _id: string;
    name: string;
    avatarUrl?: string;
    ratingAvg?: number;
    reviewsCount?: number;
  } | null;
}

interface SkillCardProps {
  offer: SkillOffer;
  isPreview?: boolean;
}

export const SkillCard: React.FC<SkillCardProps> = ({ offer, isPreview = false }) => {
  const owner = offer.owner || { name: 'Unknown', _id: '' };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
    >
      {/* User Info Header */}
      <div className="p-5 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={owner.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(owner.name)}&background=8B5CF6&color=fff`}
            alt={owner.name}
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{owner.name}</h4>
            <div className="flex items-center gap-2 text-sm">
              {owner.ratingAvg !== undefined && owner.ratingAvg > 0 && (
                <div className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="font-medium text-gray-700">{owner.ratingAvg.toFixed(1)}</span>
                </div>
              )}
              {owner.reviewsCount !== undefined && owner.reviewsCount > 0 && (
                <span className="text-gray-500">
                  ({owner.reviewsCount} {owner.reviewsCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {offer.title}
        </h3>

        {/* Cost and Duration */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-purple-600">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">{offer.costCredits} {offer.costCredits === 1 ? 'Credit' : 'Credits'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{offer.durationMinutes || 60} min</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-5">
          {offer.description}
        </p>

        {isPreview ? (
          <Button
            variant="outline"
            disabled
            className="w-full border-purple-200 text-purple-400 font-semibold cursor-not-allowed bg-purple-50"
          >
            Preview Mode
          </Button>
        ) : (
          <Link href={`/offers/${offer._id}`} className="block">
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold shadow-md"
            >
              View Details
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
};
