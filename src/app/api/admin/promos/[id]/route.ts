import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken } from '@/lib/auth-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    const deleted = await prisma.promoCode.delete({
      where: { id },
      select: { id: true, title: true, code: true, whopId: true },
    });

    return NextResponse.json({ ok: true, deleted });
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}
