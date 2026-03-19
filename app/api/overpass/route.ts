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
    const radius = searchParams.get('radius') || '1000';

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400, headers: corsHeaders }
      );
    }

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const radiusNum = parseFloat(radius);

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

    const data = await response.json();
    
    // Enrich ATM data with status flags based on 48-hour reviews
    if (data.elements && Array.isArray(data.elements)) {
      const atmIds = data.elements.map((element: any) => `osm-${element.id}`);
      const statusMap = await getATMStatusFlags(atmIds);

      // Add statusFlag to each element
      data.elements = data.elements.map((element: any) => ({
        ...element,
        statusFlag: statusMap.get(`osm-${element.id}`) || 'green'
      }));
    }
    
    return NextResponse.json(data, { headers: corsHeaders });

  } catch (error) {
    console.error('Error in Overpass API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCors(request);
}
