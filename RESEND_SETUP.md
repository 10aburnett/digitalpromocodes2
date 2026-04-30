# Resend Email Setup - Super Easy! 🚀

## What is Resend?
Resend is a modern email service designed for developers. It's **much easier** than Gmail SMTP and **more reliable** for sending emails from websites.

## Quick Setup (5 minutes)

### Step 1: Create Free Resend Account
1. Go to [resend.com](https://resend.com)
2. Click **"Sign up"**
3. Use your `whpcodes@gmail.com` email to sign up
4. Verify your email address

### Step 2: Get Your API Key
1. After signing up, you'll see the dashboard
2. Click **"API Keys"** in the sidebar
3. Click **"Create API Key"**
4. Name it: `WHPCodes Website`
5. Copy the API key (starts with `re_`)

### Step 3: Add Domain (Optional but Recommended)
1. Go to **"Domains"** in the dashboard
2. Click **"Add Domain"**
3. Enter: `whpcodes.com`
4. Follow the DNS setup instructions (or skip for now)

### Step 4: Update Your .env File
Replace the line in your `.env` file:
```env
RESEND_API_KEY="re_your_actual_api_key_here"
```

### Step 5: Test It!
1. Start your website: `npm run dev`
2. Test the email: `curl http://localhost:3000/api/test-email`
3. Check your `whpcodes@gmail.com` inbox!

## How It Works
- **Contact form emails** → Sent to `whpcodes@gmail.com`
- **Auto-reply emails** → Sent to the user who submitted the form
- **From address**: `contact@whpcodes.com` (looks professional)
- **Reply-to**: User's email (so you can reply directly)

## Benefits of Resend
✅ **Free tier**: 3,000 emails/month  
✅ **No authentication headaches**  
✅ **Better deliverability** than Gmail SMTP  
✅ **Professional sender address**  
✅ **Real-time email tracking**  
✅ **5-minute setup**  

## Testing
- **Test config**: GET `http://localhost:3000/api/test-email`
- **Send test email**: POST `http://localhost:3000/api/test-email`
- **Try contact form**: Go to `/contact` on your website

## Free Tier Limits
- **3,000 emails/month** (way more than you'll need)
- **100 emails/day**
- **No credit card required**

## Next Steps
1. Sign up at resend.com
2. Get your API key
3. Update the .env file
4. Test the contact form
5. You're done! 🎉

All contact form messages will now be delivered straight to your `whpcodes@gmail.com` inbox!