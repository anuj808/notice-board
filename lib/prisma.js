import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const globalForPrisma = globalThis

let prismaInstance

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL)
    const connectionOptions = {
      host: url.hostname || 'localhost',
      port: url.port ? parseInt(url.port) : 3306,
      user: url.username || 'root',
      password: url.password ? decodeURIComponent(url.password) : undefined,
      database: url.pathname ? url.pathname.substring(1) : undefined,
      connectionLimit: 5,
      connectTimeout: 10000, // 10 seconds timeout instead of 1001ms
    }

    // Determine SSL settings
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (!isLocal) {
      connectionOptions.ssl = {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: false, // Default false for cloud DB self-signed certs
      }
      
      // Permit override via connection string param (e.g. ?sslrejectunauthorized=true)
      const rejectParam = url.searchParams.get('sslrejectunauthorized')
      if (rejectParam !== null) {
        connectionOptions.ssl.rejectUnauthorized = rejectParam === 'true'
      }
    }

    const adapter = new PrismaMariaDb(connectionOptions)

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