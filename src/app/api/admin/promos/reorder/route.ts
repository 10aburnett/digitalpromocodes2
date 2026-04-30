import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/auth-utils";

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return NextResponse.json(
        { error: "orderedIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Update each promo code's displayOrder to its array index
    await prisma.$transaction(
      orderedIds.map((id: string, index: number) =>
        prisma.promoCode.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error reordering promo codes:", error);
    return NextResponse.json(
      { error: "Failed to reorder promo codes" },
      { status: 500 }
    );
  }
}
