import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const legalPage = await prisma.legalPage.findUnique({
      where: { slug }
    });
    
    if (!legalPage) {
      return NextResponse.json(
        { error: 'Legal page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(legalPage);
  } catch (error) {
    console.error('Error fetching legal page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch legal page' },
      { status: 500 }
    );
  }
} 