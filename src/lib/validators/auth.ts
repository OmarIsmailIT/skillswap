import {z} from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long.").max(30, "Name must be at most 30 characters long."),
  email: z.string().email("Invalid email address."),
  password: z.string()
    .min(8, "Password must be at least 8 characters long.")
    .max(100, "Password must be at most 100 characters long."),
  confirmPassword: z.string().optional(), // optional for backend
});


export const loginSchema = z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(8).max(100),
});