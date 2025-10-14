# Task Management System

A professional task management system built with Next.js 14+, PostgreSQL, Prisma, and shadcn/ui. Features role-based access control with separate admin and user dashboards, real-time notifications, and a comprehensive task management system.

## 🚀 Features

### Admin Features
- **Dashboard Overview**: Statistics and recent activity
- **Task Management**: Create, assign, update, and delete tasks
- **Calendar View**: Interactive calendar with task scheduling
- **User Management**: View and manage system users
- **Real-time Notifications**: Automatic notifications for task assignments

### User Features
- **Personal Dashboard**: Overview of assigned tasks and notifications
- **Task Management**: Update task status and view details
- **Notifications**: Real-time notifications for task updates
- **Task History**: View all assigned tasks with status tracking

### Core Features
- ✅ **Authentication**: Secure sign-up/sign-in with role-based access
- ✅ **Task Management**: Full CRUD operations with status tracking
- ✅ **Calendar Integration**: Interactive calendar with task scheduling
- ✅ **Real-time Notifications**: Automatic notifications for task events
- ✅ **Responsive Design**: Modern UI with shadcn/ui components
- ✅ **Type Safety**: Full TypeScript implementation with Zod validation
- ✅ **Database Relations**: Proper Prisma schema with relationships

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI Library**: shadcn/ui (Tailwind CSS)
- **Data Fetching**: TanStack Query (React Query)
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Form Handling**: React Hook Form + Zod
- **Calendar**: react-big-calendar
- **Styling**: Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd taskmanagment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/           # Dashboard pages
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   ├── calendar/
│   │   │   └── users/
│   │   └── user/               # User dashboard
│   │       ├── dashboard/
│   │       ├── tasks/
│   │       └── notifications/
│   ├── api/                    # API routes
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── notifications/
│   │   └── users/
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   ├── tasks/                  # Task management components
│   ├── calendar/               # Calendar components
│   ├── notifications/          # Notification components
│   └── providers.tsx           # Context providers
├── lib/
│   ├── auth.ts                 # NextAuth configuration
│   ├── prisma.ts              # Prisma client
│   ├── utils.ts               # Utility functions
│   └── validations/            # Zod schemas
├── hooks/                      # Custom React hooks
└── types/                      # TypeScript type definitions
```

## 🔐 Authentication

The system uses NextAuth.js v5 with credentials provider:

- **Sign Up**: Create new accounts with role selection
- **Sign In**: Authenticate with email/password
- **Role-based Access**: Admin and User roles with different permissions
- **Session Management**: JWT-based sessions with automatic refresh

## 📊 Database Schema

### Users
- `id`, `name`, `email`, `password`, `role`, `image`
- Relationships: assigned tasks, created tasks, notifications

### Tasks
- `id`, `taskName`, `taskDescription`, `startDate`, `endDate`
- `status`, `priority`, `assignedToId`, `createdById`
- Relationships: assigned user, created by user, notifications

### Notifications
- `id`, `title`, `message`, `status`, `type`
- `userId`, `taskId`
- Relationships: user, task

## 🎨 UI Components

Built with shadcn/ui components:
- **Forms**: React Hook Form with Zod validation
- **Data Display**: Cards, tables, badges, avatars
- **Navigation**: Sidebar, header, dropdown menus
- **Feedback**: Notifications, loading states, error handling
- **Layout**: Responsive grid system with Tailwind CSS

## 🔄 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Tasks
- `GET /api/tasks` - List tasks (filtered by role)
- `POST /api/tasks` - Create task (admin only)
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task (admin only)

### Notifications
- `GET /api/notifications` - List user notifications
- `PATCH /api/notifications/[id]` - Mark notification as read

### Users
- `GET /api/users` - List users (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 📝 Usage Examples

### Creating a Task (Admin)

```typescript
const taskData = {
  taskName: "Implement user authentication",
  taskDescription: "Add login and registration functionality",
  startDate: new Date("2024-01-15"),
  endDate: new Date("2024-01-20"),
  status: "TODO",
  priority: "HIGH",
  assignedToId: "user-id"
}

const response = await fetch("/api/tasks", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(taskData)
})
```

### Updating Task Status

```typescript
const response = await fetch(`/api/tasks/${taskId}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ status: "IN_PROGRESS" })
})
```

## 🔧 Customization

### Adding New Task Statuses

1. Update the `TaskStatus` enum in `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Update the UI components to include the new status

### Adding New Notification Types

1. Update the notification type in the database
2. Add new notification creation logic in API routes
3. Update the notification display components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🎯 Roadmap

- [ ] File attachments for tasks
- [ ] Task comments and collaboration
- [ ] Activity logs and audit trails
- [ ] Email notifications
- [ ] Task templates
- [ ] Drag & drop Kanban board
- [ ] Export functionality (CSV/PDF)
- [ ] Advanced search and filters
- [ ] Analytics and reporting
- [ ] Dark mode theme