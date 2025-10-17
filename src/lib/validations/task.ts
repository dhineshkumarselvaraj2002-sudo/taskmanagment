import { z } from "zod"

export const taskSchema = z.object({
  taskName: z.string().min(3, "Task name must be at least 3 characters"),
  taskDescription: z.string().min(10, "Description must be at least 10 characters"),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "CANCELLED", "BLOCKED"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  estimatedHours: z.number().positive().optional(),
  assignedToId: z.string().min(1, "Assigned user is required"),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
})

export const taskUpdateSchema = taskSchema.partial()

export const taskFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED", "CANCELLED", "BLOCKED"])).optional(),
  priority: z.array(z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])).optional(),
  assignedTo: z.array(z.string()).optional(),
  createdBy: z.array(z.string()).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  tags: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  taskId: z.string().min(1, "Task ID is required"),
})

export const timeLogSchema = z.object({
  duration: z.number().positive("Duration must be positive"),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  taskId: z.string().min(1, "Task ID is required"),
}).refine((data) => !data.endTime || data.endTime > data.startTime, {
  message: "End time must be after start time",
  path: ["endTime"],
})

export const attachmentSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileUrl: z.string().url("Invalid file URL"),
  fileSize: z.number().positive("File size must be positive"),
  fileType: z.string().min(1, "File type is required"),
  taskId: z.string().min(1, "Task ID is required"),
})

export type TaskInput = z.infer<typeof taskSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type TaskFiltersInput = z.infer<typeof taskFiltersSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type TimeLogInput = z.infer<typeof timeLogSchema>
export type AttachmentInput = z.infer<typeof attachmentSchema>