import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    gmailClientId: process.env.GMAIL_CLIENT_ID ? 'Set' : 'Not set',
    gmailClientSecret: process.env.GMAIL_CLIENT_SECRET ? 'Set' : 'Not set',
    gmailRefreshToken: process.env.GMAIL_REFRESH_TOKEN ? 'Set' : 'Not set',
    databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
    nextauthSecret: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
  });
} 