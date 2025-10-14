# NextAuth.js Setup Guide

This guide shows how to set up NextAuth.js authentication in your Next.js project with Google OAuth and Credentials providers.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanagement"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### 3. Run the Project

```bash
npm run dev
```

## 📁 File Structure

```
src/
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth API route
│   ├── layout.tsx                       # Root layout with SessionProvider
│   └── page.tsx                         # Home page with auth demo
├── lib/
│   └── auth.ts                          # NextAuth configuration
└── components/
    └── server-example.tsx              # Server component example
```

## 🔧 Configuration Files

### `src/lib/auth.ts`
```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Demo credentials
        if (credentials.email === "admin@test.com" && credentials.password === "1234") {
          return {
            id: "demo-user",
            email: "admin@test.com",
            name: "Demo Admin",
            role: "ADMIN",
          }
        }
        // Your database logic here
        return null
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
```

### `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

### `src/app/layout.tsx`
```typescript
import { Providers } from "@/components/providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

### `src/components/providers.tsx`
```typescript
"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </SessionProvider>
  )
}
```

## 🎯 Features Implemented

✅ **Google OAuth Provider** - Sign in with Google account
✅ **Credentials Provider** - Email/password authentication with demo credentials
✅ **Session Management** - JWT-based sessions with automatic refresh
✅ **Server Components** - `getServerSession(authOptions)` support
✅ **Client Components** - `useSession()` hook for client-side auth
✅ **TypeScript Support** - Full type safety with NextAuth types
✅ **Tailwind CSS** - Minimal styling with responsive design

## 🔐 Authentication Flow

1. **Not Authenticated**: Shows "Sign in with Google" and "Demo Login" buttons
2. **Authenticated**: Shows user info and "Sign Out" button
3. **Server Components**: Can access session with `getServerSession(authOptions)`
4. **Client Components**: Can access session with `useSession()` hook

## 🧪 Testing

### Demo Credentials
- Email: `admin@test.com`
- Password: `1234`

### Google OAuth
- Requires Google Cloud Console setup
- Redirects to Google's OAuth flow
- Returns user info after successful authentication

## 🚀 Production Deployment

1. Set up production database
2. Update `DATABASE_URL` in environment variables
3. Set up Google OAuth for production domain
4. Update `NEXTAUTH_URL` to production domain
5. Use strong `NEXTAUTH_SECRET` for production

## 📚 Next Steps

- Add more OAuth providers (GitHub, Discord, etc.)
- Implement user registration
- Add role-based access control
- Set up database user management
- Add email verification
- Implement password reset functionality
