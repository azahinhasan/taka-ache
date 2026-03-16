# Google Places API Setup Guide

This guide explains how to add Google Places API integration to get **significantly more ATM locations** than OpenStreetMap alone.

## Why Add Google Places API?

- **Better Coverage**: Google Maps has more comprehensive ATM data, especially in Bangladesh
- **More Accurate**: Google's data is frequently updated by businesses and users
- **Enhanced Details**: Better information about ATM operators, addresses, and availability
- **Optional**: The app works fine without it, but adding it improves results dramatically

## Free Tier Information

Google Places API offers a **generous free tier**:
- **$200 free credit per month** (covers ~28,000 requests)
- Nearby Search: ~$0.032 per request
- **For personal use, this is essentially free**

## Setup Instructions

### Step 1: Get a Google Cloud Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Accept terms of service if prompted

### Step 2: Create a New Project

1. Click the project dropdown at the top
2. Click "New Project"
3. Name it "ATM Locator" (or any name you prefer)
4. Click "Create"

### Step 3: Enable Places API

1. In the Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Places API"
3. Click on **"Places API (New)"** 
4. Click **"Enable"**

### Step 4: Create API Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"Create Credentials"** > **"API Key"**
3. Your API key will be generated
4. **Important**: Click "Edit API Key" to restrict it:
   - Under "API restrictions", select "Restrict key"
   - Check only **"Places API (New)"**
   - Under "Application restrictions", choose:
     - **"HTTP referrers"** for production
     - Add your domain (e.g., `yourdomain.com/*`)
     - For local development, add `localhost:*`
   - Click "Save"

### Step 5: Add API Key to Your Project

1. Create a file named `.env.local` in your project root:
   ```bash
   # In the project directory
   touch .env.local
   ```

2. Add your API key to `.env.local`:
   ```env
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE
   ```

3. **Never commit `.env.local` to git** (it's already in `.gitignore`)

### Step 6: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 7: Verify It's Working

1. Open the browser console (F12)
2. Look for a log message like:
   ```
   Found X ATM locations (Y from OSM, Z from Google)
   ```
3. You should see significantly more ATM markers on the map!

## Cost Monitoring

### Set Up Billing Alerts

1. Go to **Billing** > **Budgets & alerts**
2. Create a budget alert for $5 or $10
3. You'll get email notifications if costs approach this

### Monitor Usage

1. Go to **APIs & Services** > **Dashboard**
2. View your Places API usage
3. Typical personal use: 10-50 requests/day = **well within free tier**

## Troubleshooting

### "This API project is not authorized to use this API"

- Make sure you enabled **Places API (New)**, not the old Places API
- Wait 1-2 minutes after enabling the API

### No Additional ATMs Showing

- Check browser console for errors
- Verify API key is in `.env.local`
- Restart the development server
- Check API key restrictions aren't blocking localhost

### CORS Errors

- Google Places API should be called from your backend in production
- For development, the current implementation works
- For production deployment, consider creating a Next.js API route

## Production Deployment

For production, it's recommended to proxy Google Places requests through your backend:

1. Create `app/api/atm/route.ts`:
```typescript
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const radius = searchParams.get('radius');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY; // Server-side only
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=atm&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  return NextResponse.json(data);
}
```

2. Update `atmService.ts` to call your API route instead of Google directly

## Alternative: Keep It Free

If you prefer to stay 100% free without any API keys:

The enhanced OpenStreetMap query now includes:
- ✅ Standalone ATMs
- ✅ Bank branches (which usually have ATMs)
- ✅ Financial institutions

This provides **better coverage than before**, even without Google Places API.

## Summary

| Option | Coverage | Cost | Setup Complexity |
|--------|----------|------|------------------|
| OSM Only (Default) | Good | Free | None |
| OSM + Google Places | Excellent | Free* | 10 minutes |

*Free for personal use within Google's $200/month credit

---

**Recommendation**: Add Google Places API for the best experience. The setup takes 10 minutes and dramatically improves ATM coverage in Bangladesh.
