import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Force dynamic - test route should never be statically generated
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log('Testing Gmail OAuth2 configuration...');
    
    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    console.log('OAuth2 client created, getting access token...');
    
    // Get access token
    const accessToken = await oauth2Client.getAccessToken();
    console.log('Access token obtained successfully');
    
    return NextResponse.json({
      success: true,
      message: "Gmail OAuth2 configuration is working!",
      hasAccessToken: !!accessToken.token
    });
    
  } catch (error: any) {
    console.error('Gmail OAuth2 test failed:', error);
    return NextResponse.json({
      success: false,
      message: "Gmail OAuth2 configuration failed",
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
} 