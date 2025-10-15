import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import { findUserByEmail, verifyPassword } from "./users"
import { UserRole } from "@/types"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" as const },
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  allowDangerousEmailAccountLinking: true,
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "USER" as UserRole, // Default role for Google sign-ins
        }
      }
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Demo credentials for testing
        if (credentials.email === "admin@test.com" && credentials.password === "1234") {
          return {
            id: "demo-user",
            email: "admin@test.com",
            name: "Demo Admin",
            role: "ADMIN" as UserRole,
          }
        }

        const user = await findUserByEmail(credentials.email as string)
        
        if (!user) {
          console.log("User not found:", credentials.email)
          return null
        }

        if (!user.password) {
          console.log("No password set for user:", credentials.email)
          return null
        }

        const isValidPassword = await verifyPassword(credentials.password as string, user.password)
        if (!isValidPassword) {
          console.log("Invalid password for user:", credentials.email)
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow Google OAuth sign-ins
      if (account?.provider === "google") {
        return true
      }
      // Allow credentials sign-ins
      if (account?.provider === "credentials") {
        return true
      }
      return true
    },
    async linkAccount({ user, account, profile }) {
      // Allow linking accounts
      return true
    },
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
}

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions)
