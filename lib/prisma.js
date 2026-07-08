import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis

let prismaInstance

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL)
    const adapter = new PrismaMariaDb({
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username || 'root',
      password: url.password ? decodeURIComponent(url.password) : undefined,
      database: url.pathname ? url.pathname.substring(1) : undefined,
      connectionLimit: 5,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true,
      },
    })

    prismaInstance = globalForPrisma.prisma || new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn'],
    })
  } catch (e) {
    console.error('Failed to parse DATABASE_URL for Prisma adapter:', e)
    prismaInstance = globalForPrisma.prisma || new PrismaClient({
      log: ['query', 'error', 'warn'],
    })
  }
} else {
  // Fallback / standard client instantiation during build
  prismaInstance = globalForPrisma.prisma || new PrismaClient({
    log: ['query', 'error', 'warn'],
  })
}

export const prisma = prismaInstance

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}