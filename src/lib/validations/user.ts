import { z } from "zod"

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["USER", "ADMIN"]),
  isActive: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
})

export const userUpdateSchema = userSchema.partial().omit({ password: true })

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.array(z.enum(["USER", "ADMIN"])).optional(),
  isActive: z.boolean().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
})

export type UserInput = z.infer<typeof userSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type UserFiltersInput = z.infer<typeof userFiltersSchema>
