import "server-only";
import { NextResponse } from "next/server";
import { getOfferBySlug } from '@/lib/data';

// Cache for 5 minutes
export const revalidate = 300;

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // Fetch from database using the existing data function
    const offerData = await getOfferBySlug(slug);

    if (!offerData) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Transform to only the fields needed for the hero section first paint
    const heroData = {
      id: offerData.id,
      name: offerData.name,
      logo: offerData.logo,
      price: offerData.price,
      category: offerData.category,
      affiliateLink: offerData.affiliateLink,
      // Include first promo code for instant display
      firstPromo: offerData.PromoCode?.[0] ? {
        id: offerData.PromoCode[0].id,
        title: offerData.PromoCode[0].title,
        code: offerData.PromoCode[0].code,
        type: offerData.PromoCode[0].type,
        value: offerData.PromoCode[0].value,
      } : null,
    };

    // Set short-lived cache headers to help CDNs
    return NextResponse.json(heroData, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}