// src/lib/validators/offer.ts
import { z } from 'zod';

export const createOfferSchema = z.object({
  title: z.string().min(3).max(120, "Title must be between 3 and 120 characters long."),
  description: z.string().min(10).max(2000, "Description must be between 10 and 2000 characters long."),
  category: z.string().min(2).max(50).optional(),
  tags: z.array(z.string().min(2).max(30)).max(10, "Tags must contain at most 10 items").optional(),
  durationMinutes: z.number().int().min(15).max(240),
  costCredits: z.number().int().min(1),
  locationType: z.enum(['online', 'in_person']).optional(),
  timezone: z.string().max(50).optional(),
});