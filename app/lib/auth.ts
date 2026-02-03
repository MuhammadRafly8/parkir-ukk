import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { Role } from './types/enums'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user || !user.status_aktif) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  // Log aktivitas
  await prisma.logAktivitas.create({
    data: {
      id_user: user.id_user,
      aktivitas: `Login ke sistem`,
    },
  })

  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function createActivityLog(userId: number, aktivitas: string) {
  return prisma.logAktivitas.create({
    data: {
      id_user: userId,
      aktivitas,
    },
  })
}
