import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LAUNCH_MODE, LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort'

// GET /api/whops/list - Get list of whops for dropdowns
export async function GET() {
  try {
    // Launch cohort gate: Query only cohort slugs at DB level in launch mode
    const whereClause = LAUNCH_MODE && LAUNCH_COHORT_SLUGS.size > 0
      ? { slug: { in: Array.from(LAUNCH_COHORT_SLUGS) } }
      : {};

    const whops = await prisma.deal.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(whops)
  } catch (error) {
    console.error('Error fetching whops list:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}