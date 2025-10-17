import { User, Task, Notification, Comment, Attachment, TimeLog, ActivityLog, ChecklistItem, TaskTemplate } from "@prisma/client"

export type UserRole = "ADMIN" | "USER"
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "CANCELLED" | "BLOCKED"
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type NotificationType = "TASK_ASSIGNED" | "TASK_UPDATED" | "TASK_COMPLETED" | "TASK_COMMENTED" | "DEADLINE_APPROACHING" | "DEADLINE_PASSED" | "STATUS_CHANGED" | "PRIORITY_CHANGED" | "USER_MENTIONED"
export type NotificationStatus = "UNREAD" | "READ"

export interface ExtendedUser extends User {
  assignedTasks?: Task[]
  createdTasks?: Task[]
  notifications?: Notification[]
  comments?: Comment[]
  timeLogs?: TimeLog[]
  activityLogs?: ActivityLog[]
  _count?: {
    assignedTasks?: number
    createdTasks?: number
  }
}

export interface ExtendedTask extends Task {
  assignedTo?: User
  createdBy?: User
  notifications?: Notification[]
  comments?: Comment[]
  attachments?: Attachment[]
  timeLogs?: TimeLog[]
  activityLogs?: ActivityLog[]
  checklistItems?: ChecklistItem[]
}

export interface ExtendedNotification extends Notification {
  user?: User
  task?: Task
}

export interface ExtendedComment extends Comment {
  user?: User
  task?: Task
}

export interface ExtendedAttachment extends Attachment {
  task?: Task
}

export interface ExtendedTimeLog extends TimeLog {
  user?: User
  task?: Task
}

export interface ExtendedActivityLog extends ActivityLog {
  user?: User
  task?: Task
}

export interface ExtendedChecklistItem extends ChecklistItem {
  task?: Task
}

export interface ExtendedTaskTemplate extends TaskTemplate {}

// Dashboard Stats
export interface DashboardStats {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  totalUsers: number
  completionRate: number
  recentTasks: ExtendedTask[]
  upcomingDeadlines: ExtendedTask[]
}

// User Dashboard Stats
export interface UserDashboardStats {
  myTasks: number
  completedTasks: number
  pendingTasks: number
  overdueTasks: number
  completionRate: number
  todaysTasks: ExtendedTask[]
  upcomingDeadlines: ExtendedTask[]
  recentActivity: ActivityLog[]
}

// Task Filters
export interface TaskFilters {
  search?: string
  status?: TaskStatus[]
  priority?: Priority[]
  assignedTo?: string[]
  createdBy?: string[]
  startDate?: Date
  endDate?: Date
  tags?: string[]
  category?: string[]
}

// Notification Filters
export interface NotificationFilters {
  type?: NotificationType[]
  status?: NotificationStatus[]
  dateFrom?: Date
  dateTo?: Date
}

// Analytics
export interface TaskAnalytics {
  completionRate: number
  tasksByStatus: { status: TaskStatus; count: number }[]
  tasksByPriority: { priority: Priority; count: number }[]
  userPerformance: { user: User; completedTasks: number; totalTasks: number }[]
  monthlyTrends: { month: string; completed: number; created: number }[]
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface TaskFormData {
  taskName: string
  taskDescription: string
  startDate: Date
  endDate: Date
  status: TaskStatus
  priority: Priority
  category?: string
  tags: string[]
  estimatedHours?: number
  assignedToId: string
}

export interface UserFormData {
  name: string
  email: string
  password?: string
  role: UserRole
  isActive: boolean
  emailNotifications: boolean
}

export interface CommentFormData {
  content: string
  taskId: string
}

export interface TimeLogFormData {
  duration: number
  description?: string
  startTime: Date
  endTime?: Date
  taskId: string
}

// Calendar Types
export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    task: ExtendedTask
  }
}

// Search Types
export interface SearchResult {
  tasks: ExtendedTask[]
  users: User[]
  total: number
}

// File Upload Types
export interface FileUpload {
  file: File
  taskId: string
  onProgress?: (progress: number) => void
}

export interface UploadedFile {
  id: string
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  createdAt: Date
}

// Time Tracking Types
export interface TimeTrackingSession {
  id: string
  taskId: string
  startTime: Date
  endTime?: Date
  duration?: number
  isActive: boolean
}

// Activity Log Types
export interface ActivityLogEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  changes?: Record<string, any>
  createdAt: Date
  user: User
  task?: Task
}

// Notification Types
export interface NotificationPayload {
  title: string
  message: string
  type: NotificationType
  userId: string
  taskId?: string
}

// Chart Data Types
export interface ChartData {
  name: string
  value: number
  color?: string
}

export interface LineChartData {
  name: string
  completed: number
  created: number
}

export interface BarChartData {
  name: string
  value: number
  fill?: string
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  filters?: TaskFilters
  dateRange?: {
    start: Date
    end: Date
  }
}

// Settings Types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  emailNotifications: boolean
  pushNotifications: boolean
}

// Error Types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Loading States
export interface LoadingState {
  isLoading: boolean
  error?: string
}

// Table Types
export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  onRowClick?: (item: T) => void
}

// Modal Types
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

// Toast Types
export interface ToastProps {
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

// Breadcrumb Types
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ReactNode
}

// Navigation Types
export interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  badge?: number
  children?: NavItem[]
}

// Filter Types
export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterGroup {
  label: string
  options: FilterOption[]
  multiple?: boolean
}

// Sort Types
export interface SortOption {
  key: string
  label: string
  direction: 'asc' | 'desc'
}

// Pagination Types
export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showSizeChanger?: boolean
  pageSize?: number
  onPageSizeChange?: (size: number) => void
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    surface: string
    text: string
    textSecondary: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
}

// Search Params Type
export interface SearchParams {
  [key: string]: string | string[] | undefined
}