import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius') || '1000';

    if (!lat || !lon) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon' },
        { status: 400 }
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
        node["amenity"="bank"]["atm"="yes"](${south},${west},${north},${east});
        way["amenity"="bank"]["atm"="yes"](${south},${west},${north},${east});
        node["amenity"="bank"](${south},${west},${north},${east});
        way["amenity"="bank"](${south},${west},${north},${east});
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
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in Overpass API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
