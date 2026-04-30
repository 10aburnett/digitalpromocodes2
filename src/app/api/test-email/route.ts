import { NextResponse } from 'next/server';
import { testEmailConfig, sendContactEmail } from '@/lib/email';

export async function GET() {
  try {
    const isValid = await testEmailConfig();
    
    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Email configuration is invalid. Please check your SMTP settings."
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Email configuration is valid!"
    });
    
  } catch (error: any) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      message: "Email test failed",
      error: error.message
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    // Send a test email
    await sendContactEmail({
      name: "Test User",
      email: "test@example.com",
      subject: "Test Contact Form",
      message: "This is a test message from the contact form to verify email functionality is working correctly."
    });
    
    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!"
    });
    
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({
      success: false,
      message: "Test email failed",
      error: error.message
    }, { status: 500 });
  }
}