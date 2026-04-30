import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "@/lib/auth-utils";

interface DecodedToken {
  id: string;
  email: string;
  role: string;
}

export async function DELETE(request: Request) {
  try {
    // Try both authentication methods
    let isAuthorized = false;
    
    // 1. Check JWT token in cookies (admin-token)
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('admin-token')?.value;
      
      if (token) {
        console.log("Found admin-token, verifying...");
        const decoded = verify(token, JWT_SECRET) as DecodedToken;
        if (decoded.role === "ADMIN") {
          isAuthorized = true;
          console.log("Authorized via JWT token");
        }
      }
    } catch (error) {
      console.error("JWT verification error:", error);
    }
    
    // 2. Try NextAuth session as fallback
    if (!isAuthorized) {
      console.log("Trying NextAuth session...");
      const session = await getServerSession(authOptions);
      console.log("Session:", session);
      if (session?.user?.role === "ADMIN") {
        isAuthorized = true;
        console.log("Authorized via NextAuth session");
      }
    }

    // Return 401 if not authorized
    if (!isAuthorized) {
      console.log("Authorization failed");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all offer tracking data using a raw SQL DELETE query
    console.log("Executing DELETE query on OfferTracking table");
    const result = await prisma.$executeRaw`DELETE FROM "OfferTracking"`;
    console.log("Delete operation completed");

    return NextResponse.json({
      success: true,
      message: "Successfully wiped all analytics data"
    });
  } catch (error) {
    console.error("Error wiping analytics data:", error);
    return NextResponse.json(
      { error: "Failed to wipe analytics data" },
      { status: 500 }
    );
  }
} 