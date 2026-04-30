import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Configure NextAuth route handler
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests
export { handler as GET, handler as POST };

// Set route configuration options - makes this route fully dynamic
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 