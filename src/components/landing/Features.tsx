'use client';

import { motion } from 'framer-motion';
import { Share2, Users, TrendingUp, ArrowRight } from 'lucide-react';

export const Features = () => {
  const steps = [
    {
      number: '01',
      title: 'Share Your Skills',
      description: 'Create a profile showcasing what you can teach. From coding to cooking, share your expertise with the community.',
      icon: Share2,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      number: '02',
      title: 'Connect & Exchange',
      description: 'Browse skills you want to learn, connect with others, and arrange skill exchange sessions. No money needed!',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      number: '03',
      title: 'Learn & Grow',
      description: 'Start learning new skills while teaching others. Build your knowledge, expand your network, and grow together.',
      icon: TrendingUp,
      color: 'bg-pink-50 text-pink-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            How SkillSwap Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Simple, fun, and rewarding! Start trading skills in three easy steps.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full transition-all duration-300 group-hover:shadow-2xl group-hover:-translate-y-2">
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110`}>
                  <step.icon className="w-8 h-8" />
                </div>

                <div className="absolute top-8 right-8 text-6xl font-black text-gray-100 -z-10 select-none group-hover:text-gray-200 transition-colors">
                  {step.number}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {step.description}
                </p>

                <div className="flex items-center text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
