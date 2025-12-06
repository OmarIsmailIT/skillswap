'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Users, Globe, Star, Activity } from 'lucide-react';

const StatItem = ({ number, label, description, icon: Icon, color, delay }: any) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl font-extrabold text-gray-900 mb-1">
        {number}
      </div>
      <div className="font-semibold text-gray-700 mb-1">{label}</div>
      <div className="text-sm text-gray-500">{description}</div>
    </motion.div>
  );
};

export const CommunityStats = () => {
  const stats = [
    {
      number: '10k+',
      label: 'Active Students',
      description: 'Learning new skills daily',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      number: '1.5M',
      label: 'Skills Exchanged',
      description: 'Total sessions completed',
      icon: Activity,
      color: 'bg-green-50 text-green-600',
    },
    {
      number: '50+',
      label: 'Countries',
      description: 'Global community reach',
      icon: Globe,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      number: '4.9',
      label: 'Average Rating',
      description: 'Community satisfaction score',
      icon: Star,
      color: 'bg-yellow-50 text-yellow-600',
    },
  ];

  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-64 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
            >
              Join Our Growing <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                Global Community
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0"
            >
              Connect with thousands of learners and teachers worldwide.
              Exchange skills, build friendships, and grow together in our vibrant community.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative h-64 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10 text-white">
                <div className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">Trusted By</div>
                <div className="text-4xl font-bold mb-4">10,000+ Users</div>
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center text-xs font-bold">
                      U{i}
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-purple-600 flex items-center justify-center text-xs font-bold">
                    +9k
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <StatItem key={stat.label} {...stat} delay={index * 0.1} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
