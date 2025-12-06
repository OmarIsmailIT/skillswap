// src/lib/validators/booking.ts
import { z } from "zod";

export const createBookingSchema = z.object({
  skillOfferId: z.string(), // the offer being booked
  dateStart: z.string().datetime(), // ISO string from frontend
  dateEnd: z.string().datetime(),
  timezone: z.string().max(50),
});
