# Gmail OAuth2 Setup - Using Your Existing Gmail

This setup allows you to use your existing `whpcodes@gmail.com` account to send emails from the contact form using OAuth2 (more secure than app passwords).

## Step 1: Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **"New Project"**
3. Name it: `WHPCodes Email`
4. Click **"Create"**

## Step 2: Enable Gmail API

1. In your new project, go to **"APIs & Services"** > **"Library"**
2. Search for **"Gmail API"**
3. Click on it and click **"Enable"**

## Step 3: Create OAuth2 Credentials

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
3. If prompted, configure the OAuth consent screen:
   - Choose **"External"**
   - App name: `WHPCodes`
   - User support email: `whpcodes@gmail.com`
   - Developer contact: `whpcodes@gmail.com`
   - Click **"Save and Continue"** through all steps
4. Back in Credentials, click **"Create Credentials"** > **"OAuth 2.0 Client IDs"**
5. Application type: **"Web application"**
6. Name: `WHPCodes Email Client`
7. Authorized redirect URIs: Add `https://developers.google.com/oauthplayground`
8. Click **"Create"**
9. **Copy the Client ID and Client Secret** (save these!)

## Step 4: Get Refresh Token

1. Go to [developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Click the **gear icon** (top right) > **"Use your own OAuth credentials"**
3. Enter your **Client ID** and **Client Secret** from Step 3
4. In the left panel, find **"Gmail API v1"**
5. Select **"https://www.googleapis.com/auth/gmail.send"**
6. Click **"Authorize APIs"**
7. Sign in with your `whpcodes@gmail.com` account
8. Click **"Allow"**
9. You'll be redirected back to the playground
10. Click **"Exchange authorization code for tokens"**
11. **Copy the Refresh Token** (save this!)

## Step 5: Update Your .env File

Replace the values in your `.env` file:

```env
# Gmail OAuth2 Configuration
GMAIL_CLIENT_ID="your-actual-client-id-from-step-3"
GMAIL_CLIENT_SECRET="your-actual-client-secret-from-step-3"
GMAIL_REFRESH_TOKEN="your-actual-refresh-token-from-step-4"
```

## Step 6: Test It!

1. Start your website: `npm run dev`
2. Test the configuration: `curl http://localhost:3000/api/test-email`
3. Send a test email: `curl -X POST http://localhost:3000/api/test-email`
4. Check your `whpcodes@gmail.com` inbox!

## How It Works

- **From**: `whpcodes@gmail.com` (your actual Gmail account)
- **To**: `whpcodes@gmail.com` (contact form notifications)
- **Auto-reply**: Sent to users who submit the form
- **OAuth2**: More secure than app passwords
- **No limitations**: Full Gmail API access

## Benefits

✅ **Uses your existing Gmail account**  
✅ **More secure than app passwords**  
✅ **No daily sending limits**  
✅ **Professional appearance**  
✅ **Replies work normally**  
✅ **Full Gmail integration**  

## Troubleshooting

- **"Invalid credentials"**: Double-check your Client ID, Client Secret, and Refresh Token
- **"Access denied"**: Make sure Gmail API is enabled in your Google Cloud project
- **"Redirect URI mismatch"**: Ensure you added `https://developers.google.com/oauthplayground` as a redirect URI

## Security Notes

- Keep your credentials secure
- The refresh token doesn't expire (unless you revoke it)
- OAuth2 is the recommended authentication method by Google
- Your credentials are only used to send emails, not read them

Once set up, all contact form submissions will be sent directly to your `whpcodes@gmail.com` inbox!