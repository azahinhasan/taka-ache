// Service for fetching ATM data from multiple sources

import { ATMLocation, OverpassResponse } from '../types/atm';

/**
 * Fetches ATM locations from Overpass API with enhanced query
 * Includes ATMs, banks, and financial institutions
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Search radius in meters (default: 5000m = 5km)
 * @returns Array of ATM locations
 */
async function fetchFromOverpass(
  lat: number,
  lon: number,
  radius: number = 5000
): Promise<ATMLocation[]> {
  try {
    // Calculate bounding box (approximate)
    const latOffset = radius / 111000; // 1 degree latitude ≈ 111km
    const lonOffset = radius / (111000 * Math.cos(lat * Math.PI / 180));

    const south = lat - latOffset;
    const north = lat + latOffset;
    const west = lon - lonOffset;
    const east = lon + lonOffset;

    // Enhanced Overpass API query
    // Searches for: ATMs, banks (which usually have ATMs), and financial institutions
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
      throw new Error(`Overpass API error: ${response.status}`);
    }

    const data: OverpassResponse = await response.json();

    // Transform Overpass data to ATMLocation format
    const atmLocations: ATMLocation[] = data.elements.map((element) => {
      // For ways, use center coordinates; for nodes, use lat/lon directly
      const latitude = element.lat || element.center?.lat || 0;
      const longitude = element.lon || element.center?.lon || 0;

      // Build address from available tags
      let address = '';
      if (element.tags?.['addr:street']) {
        address = element.tags['addr:street'];
        if (element.tags['addr:city']) {
          address += `, ${element.tags['addr:city']}`;
        }
      }

      // Determine if it's a bank or ATM
      const isBank = element.tags?.amenity === 'bank';
      const hasAtm = element.tags?.atm === 'yes';

      return {
        id: `osm-${element.id}`,
        lat: latitude,
        lon: longitude,
        name: element.tags?.name || (isBank ? 'Bank Branch' : undefined),
        operator: element.tags?.operator || element.tags?.brand,
        address: address || undefined,
      };
    });

    return atmLocations;
  } catch (error) {
    console.error('Error fetching from Overpass:', error);
    throw error;
  }
}

/**
 * Fetches ATM locations from Google Places API (requires API key)
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Search radius in meters
 * @param apiKey - Google Places API key
 * @returns Array of ATM locations
 */
async function fetchFromGooglePlaces(
  lat: number,
  lon: number,
  radius: number,
  apiKey: string
): Promise<ATMLocation[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=atm&key=${apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    return data.results.map((place: any) => ({
      id: `google-${place.place_id}`,
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
      name: place.name,
      operator: place.name,
      address: place.vicinity,
    }));
  } catch (error) {
    console.error('Error fetching from Google Places:', error);
    return [];
  }
}

/**
 * Main function to fetch ATM locations from multiple sources
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Search radius in meters (default: 5000m = 5km)
 * @param googleApiKey - Optional Google Places API key for enhanced results
 * @returns Array of ATM locations from all sources
 */
export async function fetchATMLocations(
  lat: number,
  lon: number,
  radius: number = 5000,
  googleApiKey?: string
): Promise<ATMLocation[]> {
  try {
    const results: ATMLocation[] = [];

    // Fetch from Overpass (always free)
    const overpassResults = await fetchFromOverpass(lat, lon, radius);
    results.push(...overpassResults);

    // Fetch from Google Places if API key is provided
    if (googleApiKey) {
      const googleResults = await fetchFromGooglePlaces(lat, lon, radius, googleApiKey);
      results.push(...googleResults);
    }

    // Remove duplicates based on proximity (within 50 meters)
    const uniqueResults = removeDuplicates(results, 50);

    console.log(`Found ${uniqueResults.length} ATM locations (${overpassResults.length} from OSM${googleApiKey ? `, ${results.length - overpassResults.length} from Google` : ''})`);

    return uniqueResults;
  } catch (error) {
    console.error('Error fetching ATM locations:', error);
    throw error;
  }
}

/**
 * Remove duplicate ATM locations based on proximity
 * @param locations - Array of ATM locations
 * @param thresholdMeters - Distance threshold in meters
 * @returns Array of unique ATM locations
 */
function removeDuplicates(locations: ATMLocation[], thresholdMeters: number): ATMLocation[] {
  const unique: ATMLocation[] = [];

  for (const location of locations) {
    const isDuplicate = unique.some(existing => {
      const distance = calculateDistance(
        location.lat,
        location.lon,
        existing.lat,
        existing.lon
      );
      return distance < thresholdMeters;
    });

    if (!isDuplicate) {
      unique.push(location);
    }
  }

  return unique;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Gets user's current geolocation
 * @returns Promise with user location coordinates
 */
export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
