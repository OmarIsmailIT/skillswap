import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BookingForm } from '@/components/offers/BookingForm';
import { ReviewsList } from '@/components/offers/ReviewsList';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getOffer(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/offers/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function OfferDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getOffer(id);

  if (!data || !data.offer) {
    notFound();
  }

  const offer = data.offer;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                {offer.title}
              </h1>

              <div className="flex items-center justify-between">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full">
                  {offer.category || 'General'}
                </span>
                {offer.bookingsCount !== undefined && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-sm font-medium">{offer.bookingsCount} bookings</span>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Profile Preview */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-md p-6 border border-purple-100">
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4">Your Instructor</h3>
              <div className="flex items-center gap-4">
                <Link href={`/users/${offer.owner?._id}`}>
                  <img
                    src={offer.owner?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(offer.owner?.name || 'User')}&background=8B5CF6&color=fff`}
                    alt={offer.owner?.name || 'User'}
                    className="h-16 w-16 rounded-full object-cover border-4 border-white shadow-lg hover:scale-105 transition-transform cursor-pointer"
                  />
                </Link>
                <div className="flex-1">
                  <Link href={`/users/${offer.owner?._id}`}>
                    <h4 className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors">
                      {offer.owner?.name || 'Unknown'}
                    </h4>
                  </Link>
                  <div className="flex items-center gap-4 mt-1">
                    {offer.owner?.credits?.current !== undefined && (
                      <div className="flex items-center gap-1 text-sm text-green-700">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold">{offer.owner.credits.current} Credits</span>
                      </div>
                    )}
                    {offer.owner?.ratingAvg !== undefined && (
                      <div className="flex items-center gap-1 text-sm">
                        <svg className="h-4 w-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="font-semibold text-gray-900">{offer.owner.ratingAvg.toFixed(1)}</span>
                        <span className="text-gray-600">({offer.owner.reviewsCount || 0} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About This Skill */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Skill</h2>
              <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{offer.description}</p>
              
              {offer.tags && offer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {offer.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* What You'll Get */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You'll Get</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Duration</h3>
                    <p className="text-gray-600 text-sm">{offer.durationMinutes} minutes session</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Cost</h3>
                    <p className="text-gray-600 text-sm">{offer.costCredits} {offer.costCredits === 1 ? 'Credit' : 'Credits'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600 text-sm capitalize">{offer.locationType || 'Online'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Bonus</h3>
                    <p className="text-gray-600 text-sm">Personalized feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Right 1/3 */}
          <div className="space-y-6">
            {/* Request Session Card */}
            <BookingForm 
              skillOfferId={offer._id}
              costCredits={offer.costCredits}
              durationMinutes={offer.durationMinutes}
            />

            {/* Reviews Card */}
            <ReviewsList 
              skillOfferId={offer._id}
              initialRating={offer.owner?.ratingAvg}
              initialCount={offer.owner?.reviewsCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
