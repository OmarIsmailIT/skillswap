import {z} from 'zod';

export const onboardingSchema = z.object({
    avatarUrl: z.string().url().optional(),
    bio: z.string().min(10).max(500, "Bio must be between 10 and 500 characters long.").optional(),
    topSkills: z.array(z.string().min(2).max(30)).max(10, "Skills must contain at most 10 items").optional(),
});
