'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Graphic Designer',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8B5CF6&color=fff',
      rating: 5,
      text: "I've learned so much through SkillSwap! I taught design and learned coding in return. The community is incredibly supportive and talented.",
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Web Developer',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=EC4899&color=fff',
      rating: 5,
      text: "SkillSwap has transformed the way I learn. I've connected with amazing people from around the world and gained skills I never thought possible.",
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      role: 'Language Teacher',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Rodriguez&background=F59E0B&color=fff',
      rating: 5,
      text: "Teaching Spanish while learning photography has been an incredible journey. SkillSwap makes skill exchange fun, easy, and rewarding!",
    },
  ];

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6"
          >
            What Our Community Says
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Real stories from real people who are learning and growing together.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="bg-gray-50 rounded-3xl p-8 relative hover:shadow-xl transition-shadow duration-300"
            >
              <Quote className="absolute top-8 right-8 w-10 h-10 text-purple-100" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-lg mb-8 leading-relaxed relative z-10">
                "{testimonial.text}"
              </p>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full border-2 border-white shadow-sm"
                />
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-purple-600 font-medium">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
