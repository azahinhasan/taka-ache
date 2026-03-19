import { NextRequest, NextResponse } from 'next/server';
import { handleCors, getCorsHeaders } from '@/app/lib/cors';
import { getATMStatusFlags } from '@/app/lib/atmStatus';

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius') || '10000';
    const source = searchParams.get('source') || 'google'; // 'google' or 'osm'

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400, headers: corsHeaders }
      );
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radiusNum = parseFloat(radius);

    let data: any;

    if (source === 'osm') {
      // Fetch from OpenStreetMap Overpass API
      const latOffset = radiusNum / 111000;
      const lonOffset = radiusNum / (111000 * Math.cos(latNum * Math.PI / 180));

      const south = latNum - latOffset;
      const north = latNum + latOffset;
      const west = lonNum - lonOffset;
      const east = lonNum + lonOffset;

      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="atm"](${south},${west},${north},${east});
          way["amenity"="atm"](${south},${west},${north},${east});
          relation["amenity"="atm"](${south},${west},${north},${east});
        );
        out center;
      `;

      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: query,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Overpass API request failed' },
          { status: response.status, headers: corsHeaders }
        );
      }

      data = await response.json();
      
      // Enrich OSM data with status flags based on 48-hour reviews
      if (data.elements && Array.isArray(data.elements)) {
        const atmIds = data.elements.map((element: any) => `osm-${element.id}`);
        const statusMap = await getATMStatusFlags(atmIds);

        // Add statusFlag to each element
        data.elements = data.elements.map((element: any) => ({
          ...element,
          statusFlag: statusMap.get(`osm-${element.id}`) || 'green'
        }));
      }
    } else {
      // Fetch from Google Places API
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;

      if (!apiKey) {
        console.error('Google Places API key is missing from server environment.');
        return NextResponse.json(
          { error: 'Google Places API key not configured on server' },
          { status: 500, headers: corsHeaders }
        );
      }

      const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=atm&key=${apiKey}`;

      const response = await fetch(googleUrl);
      data = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Google Places API request failed', details: data },
          { status: response.status, headers: corsHeaders }
        );
      }

      // Enrich Google Places data with status flags based on 48-hour reviews
      if (data.results && Array.isArray(data.results)) {
        const atmIds = data.results.map((atm: any) => `google-${atm.place_id}`);
        const statusMap = await getATMStatusFlags(atmIds);

        // Add statusFlag to each ATM
        data.results = data.results.map((atm: any) => ({
          ...atm,
          statusFlag: statusMap.get(`google-${atm.place_id}`) || 'green'
        }));
      }
    }

    return NextResponse.json(data, { headers: corsHeaders });
  } catch (error) {
    console.error('Error in ATM API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}
