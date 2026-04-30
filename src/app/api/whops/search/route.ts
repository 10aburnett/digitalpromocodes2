import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LAUNCH_MODE, LAUNCH_COHORT_SLUGS } from '@/lib/launch-cohort'

// Force dynamic - uses request.url
export const dynamic = "force-dynamic";

// GET /api/whops/search?q=term&limit=20 - Server-side search for whops
// OPTIMIZED: Only searches indexed fields (name, slug) for fast queries
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 results

    if (!query.trim()) {
      return NextResponse.json([])
    }

    // Normalize: remove apostrophes and special characters, then split into words
    const normalized = query.trim().replace(/[''`]/g, '').replace(/[^\w\s]/g, ' ');
    const searchWords = normalized.split(/\s+/).filter(word => word.length >= 2);

    // Generate search variations for each word (handles possessives like "cap's" matching "caps")
    const getWordVariations = (word: string): string[] => {
      const variations = [word];
      // If word ends in 's', also search without it (caps -> cap, matches "cap's")
      if (word.length > 2 && word.toLowerCase().endsWith('s')) {
        variations.push(word.slice(0, -1));
      }
      return variations;
    };

    // Build where clause - OPTIMIZED: only search indexed fields (name, slug)
    // Removed aboutContent and featuresContent to avoid slow text field scans
    const whereClause: any = {};

    const buildSearchConditions = (term: string) => [
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: term, mode: 'insensitive' } },
    ];

    if (searchWords.length > 1) {
      whereClause.AND = searchWords.map(word => {
        const variations = getWordVariations(word);
        return {
          OR: variations.flatMap(v => buildSearchConditions(v))
        };
      });
    } else if (searchWords.length === 1) {
      const variations = getWordVariations(searchWords[0]);
      whereClause.OR = variations.flatMap(v => buildSearchConditions(v));
    }

    // Launch cohort gate: Only search within cohort slugs
    if (LAUNCH_MODE && LAUNCH_COHORT_SLUGS.size > 0) {
      whereClause.slug = { in: Array.from(LAUNCH_COHORT_SLUGS) };
    }

    const whops = await prisma.deal.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        whopCategory: true
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: limit
    })

    return NextResponse.json(whops)
  } catch (error) {
    console.error('Error searching whops:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
