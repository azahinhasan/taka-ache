# Taka Ache? 🏧

A mobile-responsive web application that helps users find nearby ATM booths in Bangladesh using an interactive map powered by Leaflet.js and OpenStreetMap.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![React](https://img.shields.io/badge/React-19.2.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Leaflet](https://img.shields.io/badge/Leaflet-1.9.x-green)

## ✨ Features

- **Interactive Map**: Powered by Leaflet.js with OpenStreetMap tiles
- **Geolocation**: Automatically detects user's current location (with permission)
- **Multi-Source ATM Data**: Enhanced coverage from OpenStreetMap + optional Google Places API
- **Comprehensive Coverage**: Includes ATMs, bank branches, and financial institutions
- **Detailed Information**: View ATM details including operator, name, and address
- **Google Maps Navigation**: One-click navigation from your location to selected ATM
- **Mobile Responsive**: Fully optimized for mobile, tablet, and desktop devices
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Error Handling**: Graceful fallback to Dhaka location if geolocation fails
- **Smart Deduplication**: Automatically removes duplicate ATMs from multiple sources

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd taka-ache-frontned
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Recommended: Add Google Places API for Best Coverage

The app uses **Google Places API** as the primary data source for comprehensive ATM coverage, with OpenStreetMap as a fallback.

**Quick Setup (5 minutes):**

1. Get a **free** Google Places API key:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable "Places API (New)" → Create API key
   - **Free tier**: $200/month credit (~28,000 requests)

2. Create `.env.local` in project root:
   ```bash
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

3. Restart the server:
   ```bash
   npm run dev
   ```

**Result**: 5-10x more ATM locations!

📖 **Detailed guide**: [SETUP_API_KEY.md](./SETUP_API_KEY.md) | [Full setup](./GOOGLE_PLACES_SETUP.md)

**Without API key**: App still works using OpenStreetMap (limited coverage)

## 🏗️ Project Structure

```
taka-ache-frontned/
├── app/
│   ├── components/
│   │   ├── MapView.tsx        # Leaflet map component
│   │   └── Sidebar.tsx        # ATM details sidebar
│   ├── types/
│   │   └── atm.ts            # TypeScript interfaces
│   ├── utils/
│   │   └── atmService.ts     # API service for ATM data
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── public/                   # Static assets
└── package.json
```

## 🛠️ Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.x
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4.x
- **Map Library**: Leaflet.js + React-Leaflet
- **Map Data**: OpenStreetMap
- **ATM Data Sources**: 
  - Overpass API (OpenStreetMap) - Always free
  - Google Places API - Optional, for enhanced coverage
- **Icons**: SVG (inline)

## 📱 Key Features Explained

### 1. User Location Detection
The app requests browser geolocation permission on load. If granted, it centers the map on the user's current location. If denied or unavailable, it defaults to Dhaka, Bangladesh.

### 2. ATM Data Fetching
The app uses a **dual-source approach** with intelligent fallback:

**Primary: Google Places API** (Recommended)
- Most comprehensive ATM database
- Excellent coverage in Bangladesh
- Real-time business information
- Requires free API key (5-minute setup)
- ~$0 cost for personal use (within free tier)

**Fallback: OpenStreetMap (via Overpass API)** - Always available
- Free, no API key required
- Searches for ATMs, banks, and financial institutions
- Limited coverage compared to Google
- Used when Google API key is not configured or fails

The app automatically **deduplicates** results from both sources, removing ATMs within 50 meters of each other.

### 3. Interactive Markers
- **Blue pulsing marker**: User's current location
- **Green dollar markers**: ATM locations
- Click any ATM marker to view details in the sidebar

### 4. Sidebar Panel
Displays comprehensive ATM information:
- Unique identifier
- Operator/Bank name (if available)
- ATM name (if available)
- Address (if available)
- Coordinates
- Google Maps navigation button

### 5. Google Maps Integration
The "Navigate with Google Maps" button opens Google Maps with directions from the user's location to the selected ATM.

## 🔧 Configuration

### Adjusting Search Radius
Edit the radius parameter in `app/page.tsx`:
```typescript
const atms = await fetchATMLocations(location.lat, location.lon, 1000); // 1000 meters = 5km
```

### Changing Default Location
Modify the default coordinates in `app/page.tsx`:
```typescript
const defaultLocation = { lat: 23.8103, lon: 90.4125 }; // Dhaka, Bangladesh
```

### Map Zoom Levels
Adjust initial zoom in `app/components/MapView.tsx`:
```typescript
const map = L.map(mapContainerRef.current, {
  center: [23.8103, 90.4125],
  zoom: 13, // Change this value (1-19)
});
```

## 🌐 API Usage

### Overpass API
The app uses the public Overpass API endpoint:
```
https://overpass-api.de/api/interpreter
```

**Query Format**:
```
[out:json][timeout:25];
(
  node["amenity"="atm"](south,west,north,east);
  way["amenity"="atm"](south,west,north,east);
);
out center;
```

**Rate Limits**: The Overpass API has rate limits. For production use, consider:
- Implementing caching
- Using a private Overpass instance
- Adding request throttling

## 📦 Build & Deploy

### Production Build
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
vercel deploy
```

### Deploy to Other Platforms
The app is a standard Next.js application and can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- Google Cloud Platform
- Any Node.js hosting service

## 🎨 Customization

### Styling
The app uses Tailwind CSS. Customize colors, spacing, and components in:
- `app/globals.css` - Global styles
- Component files - Inline Tailwind classes

### Map Tiles
Change the map tile provider in `app/components/MapView.tsx`:
```typescript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);
```

Alternative tile providers:
- CartoDB: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png`
- Stamen Terrain: `https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg`

## 🐛 Troubleshooting

### Map Not Displaying
- Ensure Leaflet CSS is imported in `app/layout.tsx`
- Check browser console for errors
- Verify internet connection for tile loading

### Geolocation Not Working
- Use HTTPS (required for geolocation API)
- Check browser permissions
- Test on localhost (allowed without HTTPS)

### No ATMs Found
- Check internet connection
- Verify Overpass API is accessible
- Try a different location
- Increase search radius

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on the GitHub repository.

---

Built with ❤️ using Next.js and Leaflet.js
