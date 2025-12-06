import { Star, Award, BookOpen } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getUser(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/users/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const data = await getUser(id);

  if (!data || !data.user) {
    notFound();
  }

  const user = data.user;

  return (
    <div className="bg-gray-50 h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Compact Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar with Rating Overlay */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=8B5CF6&color=fff&size=160`}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="font-bold text-white text-sm">{user.ratingAvg?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{user.name}</h1>

                {/* Bio */}
                {user.bio && (
                  <p className="text-base text-white/90 leading-relaxed mb-4 max-w-2xl">
                    {user.bio}
                  </p>
                )}

                {/* Skills in Hero */}
                {user.topSkills && user.topSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                    {user.topSkills.map((skill: string, index: number) => {
                      const gradients = [
                        'from-blue-400 to-cyan-400',
                        'from-green-400 to-emerald-400',
                        'from-orange-400 to-red-400',
                        'from-indigo-400 to-purple-400',
                        'from-pink-400 to-rose-400',
                        'from-yellow-400 to-orange-400',
                      ];
                      const gradient = gradients[index % gradients.length];

                      return (
                        <span
                          key={index}
                          className={`px-3 py-1.5 bg-gradient-to-r ${gradient} text-white rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                        >
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
                    <Star className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
                    <span className="font-semibold">{user.ratingAvg?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-white/80">rating</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
                    <Award className="w-3.5 h-3.5" />
                    <span className="font-semibold">{user.reviewsCount || 0}</span>
                    <span className="text-xs text-white/80">reviews</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="font-semibold">{user.skillsOffered?.length || 0}</span>
                    <span className="text-xs text-white/80">skills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Skill Offers Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            Available Skill Offers
          </h2>

          {user.skillsOffered && user.skillsOffered.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {user.skillsOffered.map((offer: any) => (
                <Link
                  key={offer._id}
                  href={`/offers/${offer._id}`}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl cursor-pointer"
                >
                  <div className="p-4">
                    {/* Gradient accent bar */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                    <h3 className="font-bold text-base text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {offer.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold text-gray-900">{offer.costCredits}</span>
                        <span className="text-sm">credits</span>
                      </div>

                      {offer.avgRating !== undefined && offer.avgRating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold">{offer.avgRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex p-3 rounded-full bg-gray-100 mb-3">
                <BookOpen className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No active offers</h3>
              <p className="text-sm text-gray-500">This user hasn't created any skill offers yet.</p>
            </div>
          )}
        </div>

        {/* Compact Reviews Stats */}
        {user.reviewsCount > 0 && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg border border-yellow-100 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                  Student Reviews
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-4xl font-bold text-gray-900">{user.ratingAvg?.toFixed(1)}</div>
                  <div>
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(user.ratingAvg || 0)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 fill-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600">{user.reviewsCount} total reviews</p>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-white/60 backdrop-blur-sm rounded-xl">
                <p className="text-xs text-gray-600 text-center">Trusted by</p>
                <p className="text-xl font-bold text-gray-900 text-center mt-1">
                  {user.reviewsCount}+ students
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
