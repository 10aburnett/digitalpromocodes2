import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from './auth-utils';

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Verifies the admin JWT token from cookies
 * @returns The decoded token if valid, or null if not
 */
export async function verifyAdminToken() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("admin-token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verify(token, JWT_SECRET) as DecodedToken;
    
    if (decoded.role !== "ADMIN") {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

/**
 * Middleware function to ensure the user is authenticated as an admin
 * @param request Next.js request object
 * @returns Response or null if authenticated
 */
export async function requireAdmin(request: NextRequest) {
  const token = await verifyAdminToken();
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return null;
} 