import bcrypt from "bcryptjs"
import { prisma } from "./prisma"
import { UserRole } from "@/types"

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function createUser(userData: {
  name: string
  email: string
  password: string
  role?: UserRole
  isActive?: boolean
  emailNotifications?: boolean
}) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  })
  
  if (existingUser) {
    throw new Error("User with this email already exists")
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password)

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || "USER",
      isActive: userData.isActive ?? true,
      emailNotifications: userData.emailNotifications ?? true,
    }
  })

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    isActive: newUser.isActive,
    emailNotifications: newUser.emailNotifications,
    createdAt: newUser.createdAt,
  }
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  })
}

export async function findUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id }
  })
}

export async function updateUser(id: string, data: {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  isActive?: boolean
  emailNotifications?: boolean
}) {
  const updateData: any = { ...data }
  
  if (data.password) {
    updateData.password = await hashPassword(data.password)
  }

  return await prisma.user.update({
    where: { id },
    data: updateData
  })
}

export async function deleteUser(id: string) {
  return await prisma.user.delete({
    where: { id }
  })
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  })
}

export async function getActiveUsers() {
  return await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}
