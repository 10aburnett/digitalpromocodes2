# Email Setup Instructions

## Overview
The contact form now sends emails to `whpcodes@gmail.com` when users submit the form. This includes:
1. **Notification email** to `whpcodes@gmail.com` with the contact form details
2. **Auto-reply email** to the user confirming their message was received

## Required Setup

### 1. Gmail App Password
You need to set up a Gmail App Password for `whpcodes@gmail.com`:

1. Go to your Google Account settings
2. Select "Security" 
3. Under "Signing in to Google," select "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

### 2. Environment Variables
Update your `.env` file with the app password:

```env
# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="whpcodes@gmail.com"
SMTP_PASSWORD="your-16-character-app-password-here"
SMTP_FROM="whpcodes@gmail.com"
```

Replace `your-16-character-app-password-here` with the actual app password from Gmail.

### 3. Testing
You can test the email configuration:

1. **Test Configuration**: GET `/api/test-email`
2. **Send Test Email**: POST `/api/test-email`

## Email Features

### Contact Form Email
- **To**: whpcodes@gmail.com
- **Subject**: Contact Form: [user's subject]
- **Content**: Formatted HTML email with contact details and message
- **Reply-To**: User's email address (for easy replies)

### Auto-Reply Email
- **To**: User's email address
- **Subject**: Thank you for contacting WHPCodes - We've received your message
- **Content**: Professional confirmation email with message summary

## Updated Contact Pages
All contact email addresses have been updated to `whpcodes@gmail.com`:
- `/src/app/contact/page.tsx`
- `/src/app/[locale]/contact/page.tsx`
- `/src/app/privacy/page.tsx`
- `/src/app/[locale]/privacy/page.tsx`
- `/src/lib/i18n.ts` (all language translations)
- `/scripts/seed-pages.js`

## Error Handling
- If email sending fails, the contact form submission still succeeds (saves to database)
- Email errors are logged but don't prevent form submission
- Users always see success message when form is submitted successfully

## Next Steps
1. Set up the Gmail App Password
2. Update the `.env` file with the real password
3. Test the email functionality
4. Monitor the `whpcodes@gmail.com` inbox for contact form submissions