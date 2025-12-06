'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ListingCard } from '@/components/dashboard/ListingCard';

interface SkillOffer {
  _id: string;
  title: string;
  description: string;
  category: string;
  costCredits: number;
  durationMinutes: number;
  status: 'active' | 'inactive';
  tags?: string[];
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<SkillOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/offers?mode=mine', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch offers');
      const data = await res.json();
      setListings(data.offers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your skill offers and availability</p>
        </div>
        <Link href="/offers/create">
          <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Offer
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-purple-600 rounded-full border-t-transparent"></div>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="mx-auto h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No listings yet</h3>
          <p className="mt-2 text-gray-500 max-w-sm mx-auto">Share your skills with the community by creating your first offer.</p>
          <div className="mt-6">
            <Link href="/offers/create">
              <Button variant="outline">Create Offer</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((offer) => (
            <ListingCard
              key={offer._id}
              offer={offer}
              onUpdate={fetchListings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
