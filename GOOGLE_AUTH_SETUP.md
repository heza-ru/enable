# Google OAuth Setup Guide

This application now requires Google OAuth authentication before onboarding. Follow these steps to set up Google Sign-In:

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** for your project

## 2. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External** (for public use) or **Internal** (for organization only)
   - App name: `Enable` (or your preferred name)
   - User support email: Your email
   - Developer contact email: Your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if using External type

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `Enable Web Client`
   
   **Authorized JavaScript origins** (NO PATHS - just the domain):
   - Click "ADD URI" button
   - Add: `http://localhost:3000`
   - Add: `http://localhost:3001`
   - Add: `https://yourdomain.com` (for production)
   
   **Authorized redirect URIs** (WITH the /auth/google/callback path):
   - Scroll down to find this section (it's separate from JavaScript origins!)
   - Click "ADD URI" button
   - Add: `http://localhost:3000/auth/google/callback`
   - Add: `http://localhost:3001/auth/google/callback`
   - Add: `https://yourdomain.com/auth/google/callback` (for production)

5. Click **Create** and copy your **Client ID**

---

## ⚠️ COMMON MISTAKE:

**JavaScript Origins** = NO PATH (just `http://localhost:3000`)
**Redirect URIs** = WITH PATH (`http://localhost:3000/auth/google/callback`)

If you see "Invalid origin: URIs must not contain a path", you're adding the redirect URI to the JavaScript origins field by mistake!

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Google Client ID:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   ```

## 4. Restart the Development Server

```bash
pnpm dev
```

## How It Works

1. **First Visit**: Users see a Google Sign-In dialog
2. **Authentication**: Users sign in with their Google account
3. **Auto-fill**: User's name is automatically pulled from their Google profile
4. **Onboarding**: Users proceed through the onboarding flow with their name pre-filled
5. **Local Storage**: Google auth data is stored locally in the browser (never sent to servers)

## Security Notes

- All authentication data is stored client-side in `localStorage`
- No user data is sent to any server except Google's OAuth service
- The app remains 100% client-side with no backend
- Users can clear their auth by clearing browser data

## Troubleshooting

### "Google Client ID not configured" Error

- Make sure you've added `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env.local`
- Restart the development server after adding the variable
- Verify the Client ID is correct and ends with `.apps.googleusercontent.com`

### "redirect_uri_mismatch" Error

- Check that your authorized JavaScript origins and redirect URIs in Google Cloud Console match your app's URL
- For local development, use `http://localhost:3000` (without trailing slash)
- For production, use your actual domain with `https://`

### Google Sign-In Button Not Showing

- Check browser console for errors
- Ensure your Google Client ID is valid
- Verify you have a stable internet connection (needed to load Google's SDK)
- Make sure no ad blockers or privacy extensions are blocking Google scripts

## Development vs Production

### Development
- Use `http://localhost:3000` in authorized origins
- Can use the same Client ID for all developers

### Production
- Add your production domain to authorized origins
- Consider creating a separate OAuth client for production
- Ensure your domain uses HTTPS
