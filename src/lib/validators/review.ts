import { z } from 'zod';
export const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  text: z.string().max(1000, "Review text must be at most 1000 characters long.").optional(),
});
