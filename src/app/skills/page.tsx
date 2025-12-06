'use client';

import { useEffect, useState } from 'react';
import { SkillCard } from '@/components/skills/SkillCard';

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
  };
}

const popularTags = ['Guitar Lessons', 'Web Development', 'Spanish', 'Photography', 'Cooking'];

export default function BrowseSkillsPage() {
  const [offers, setOffers] = useState<SkillOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch('/api/offers');
        if (!res.ok) throw new Error('Failed to fetch offers');
        const data = await res.json();
        setOffers(data.offers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = searchTerm === '' ||
      (offer.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (offer.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (offer.category?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (offer.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = selectedTag === null ||
      (offer.title?.toLowerCase().includes(selectedTag.toLowerCase())) ||
      (offer.category?.toLowerCase().includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Browse Skills
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing skills from talented instructors in our community
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 w-full relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="What skill do you want to learn?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Filters - Removed for simplicity, can add back later */}

            {/* Search Button */}
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-10 py-3 rounded-xl transition-colors shadow-md hover:shadow-lg">
              Search
            </button>
          </div>

          {/* Popular Tags */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Popular:</span>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTag === tag
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No skills found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredOffers.length}</span> skill{filteredOffers.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOffers.map((offer) => (
                <SkillCard key={offer._id} offer={offer} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
