import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only initialize PrismaClient if we have a connection string
// During build time, DATABASE_URL might not be available
export const prisma = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  if (!connectionString) {
    // Return a placeholder for build time (this won't be used at runtime)
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
      // On Vercel/Netlify during build, return minimal PrismaClient
      return new PrismaClient()
    }
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client

  return client
})()