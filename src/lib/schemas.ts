import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const tripSchema = z.object({
  name: z.string().min(1, 'Trip name is required').max(100),
  description: z.string().max(500).optional(),
  cover_photo_url: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  total_budget: z.number().min(0).optional().default(0),
})

export const stopSchema = z.object({
  city_id: z.string().uuid(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

export const budgetSchema = z.object({
  transport: z.number().min(0).default(0),
  stay: z.number().min(0).default(0),
  activities: z.number().min(0).default(0),
  meals: z.number().min(0).default(0),
  misc: z.number().min(0).default(0),
  total_limit: z.number().min(0).default(0),
})

export const noteSchema = z.object({
  content: z.string().min(1),
  stop_id: z.string().uuid().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2),
  language: z.string().default('en'),
  currency: z.string().default('INR'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type TripInput = z.infer<typeof tripSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type ProfileInput = z.infer<typeof profileSchema>
