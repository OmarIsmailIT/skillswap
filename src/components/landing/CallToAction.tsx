'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CallToAction = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-purple-200 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Start your journey today</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
            Ready to Unlock Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
              Full Potential?
            </span>
          </h2>

          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners and teachers worldwide. Start trading skills,
            build connections, and grow together—completely free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-white hover:bg-gray-50 font-bold px-10 py-6 text-lg shadow-xl shadow-purple-900/20"
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Link>
            <Link href="/skills" className="w-full sm:w-auto">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-purple-400/30 text-white hover:bg-white/10 font-bold px-10 py-6 text-lg backdrop-blur-sm"
                >
                  Explore Skills
                </Button>
              </motion.div>
            </Link>
          </div>

          <p className="mt-8 text-sm text-purple-300/80 font-medium">
            No credit card required • Free forever for basic use
          </p>
        </motion.div>
      </div>
    </section>
  );
};
