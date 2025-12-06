'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Code, Palette, Globe, Music, Camera, Database, PenTool, Cpu, Layers, Smartphone, Video, Mic } from 'lucide-react';

export const PopularSkills = () => {
  const skills = [
    { name: 'Web Development', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { name: 'UI/UX Design', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { name: 'Languages', icon: Globe, color: 'from-green-500 to-emerald-500' },
    { name: 'Music Theory', icon: Music, color: 'from-yellow-500 to-orange-500' },
    { name: 'Photography', icon: Camera, color: 'from-red-500 to-rose-500' },
    { name: 'Data Science', icon: Database, color: 'from-indigo-500 to-blue-500' },
    { name: 'Content Writing', icon: PenTool, color: 'from-teal-500 to-green-500' },
    { name: 'Machine Learning', icon: Cpu, color: 'from-violet-500 to-purple-500' },
    { name: 'Graphic Design', icon: Layers, color: 'from-pink-500 to-red-500' },
    { name: 'Mobile Apps', icon: Smartphone, color: 'from-blue-600 to-indigo-600' },
    { name: 'Video Editing', icon: Video, color: 'from-orange-500 to-red-500' },
    { name: 'Public Speaking', icon: Mic, color: 'from-cyan-500 to-blue-500' },
  ];

  // Duplicate skills for seamless infinite scroll
  const marqueeSkills = [...skills, ...skills];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          Popular Skills to Learn
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover what our community is learning and teaching right now.
        </p>
      </div>

      {/* Infinite Marquee */}
      <div className="relative w-full">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-white to-transparent z-10"></div>

        <div className="flex overflow-hidden py-4">
          <motion.div
            className="flex gap-6 px-6"
            animate={{ x: "-50%" }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 30
            }}
            style={{ width: "max-content" }}
          >
            {marqueeSkills.map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-md border border-gray-100 min-w-[200px] hover:shadow-lg transition-shadow"
              >
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${skill.color} flex items-center justify-center text-white shadow-sm`}>
                  <skill.icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-800 whitespace-nowrap">
                  {skill.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="text-center mt-16">
        <Link href="/skills">
          <Button
            size="lg"
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-10 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            Explore All Categories
          </Button>
        </Link>
      </div>
    </section>
  );
};
