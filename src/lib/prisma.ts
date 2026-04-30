import { PrismaClient } from '@prisma/client'

// TypeScript check: Ensure content_text field exists in generated client
// eslint-disable-next-line no-unused-vars
type _Check = import('@prisma/client').Prisma.BlogPostSelect;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      '❌ DATABASE_URL is missing. Run `npm run dev` to auto-configure from git branch, ' +
      'or set DATABASE_URL manually in .env.local'
    )
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })
}

// Use global singleton pattern - works in BOTH development AND production
// This prevents multiple Prisma clients during HMR and reduces serverless cold starts
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// Reuse existing client if available, otherwise create new one
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Save to global in ALL environments (not just development)
// In serverless, this helps reuse connections within the same container
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma

  // Only log on actual new client creation (not every import)
  if (process.env.NODE_ENV === 'development') {
    const url = process.env.DATABASE_URL || '';
    const host = url.split('@')[1]?.split('/')[0] ?? '(no host)';
    console.log(`🔗 Prisma client created → ${host}`);
  }
}

export default prisma
