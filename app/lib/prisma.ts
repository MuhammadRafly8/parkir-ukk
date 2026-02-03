import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a handler that throws only on actual usage (not on import/build time)
const createMockClient = () => {
  const handler: ProxyHandler<any> = {
    get: () => {
      throw new Error('DATABASE_URL environment variable is not set. Prisma client cannot be used without a database connection.')
    },
  }
  return new Proxy({}, handler)
}

// Only initialize PrismaClient if we have a connection string
// During build time, DATABASE_URL might not be available
export const prisma = (() => {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // If no connection string, return a mock during build (won't be used)
  if (!connectionString) {
    // During build/compile time, return a mock that won't fail compilation
    // It will only fail at runtime if someone actually tries to use it
    return createMockClient() as unknown as PrismaClient
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