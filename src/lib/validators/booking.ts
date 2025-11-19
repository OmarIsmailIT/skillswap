import {z} from 'zod';

export const createBookingSchema = z.object({
    skillOfferId: z.string(),
    dateStart: z.date(),
    dateEnd: z.date(),
    timezone: z.string().max(50),
})