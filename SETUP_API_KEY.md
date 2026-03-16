# Quick Setup: Google Places API Key

## 🚀 5-Minute Setup for Better ATM Coverage

Currently, the app uses OpenStreetMap which has limited ATM data. Adding a **free** Google Places API key will give you **5-10x more ATM locations**!

### Step 1: Get Your Free API Key

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **"Places API (New)"**
4. Create an API key
5. Restrict the key to "Places API" only (recommended)

**Cost**: $200 free credit/month = ~28,000 requests (essentially free for personal use)

### Step 2: Add to Your App

Create a file named `.env.local` in the project root:

```bash
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE
```

### Step 3: Restart Server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

That's it! You'll now see significantly more ATMs on the map.

---

**Need detailed instructions?** See [GOOGLE_PLACES_SETUP.md](./GOOGLE_PLACES_SETUP.md) for the complete guide.

**Want to stay 100% free?** The app works without the API key using OpenStreetMap data.
