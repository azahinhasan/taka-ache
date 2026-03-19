// Service for fetching ATM data from multiple sources

import { ATMLocation, OverpassResponse } from "../types/atm";

/**
 * Fetches ATM locations from Overpass API
 * Only includes standalone ATM amenities
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Search radius in meters (default: 1000m = 5km)
 * @returns Array of ATM locations
 */
async function fetchFromOverpass(
  lat: number,
  lon: number,
  radius: number = 1000,
): Promise<ATMLocation[]> {
  try {
    // Use backend API route with source=osm parameter
    const url = `/api/atm?lat=${lat}&lon=${lon}&radius=${radius}&source=osm`;
    const response = await fetch(url);

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
      let address = "";
      if (element.tags?.["addr:street"]) {
        address = element.tags["addr:street"];
        if (element.tags["addr:city"]) {
          address += `, ${element.tags["addr:city"]}`;
        }
      }
      return {
        id: `osm-${element.id}`,
        lat: latitude,
        lon: longitude,
        name: element.tags?.operator
          ? `${element.tags.operator} ATM`
          : element.tags?.brand
            ? `${element.tags.brand} ATM`
            : "ATM",
        operator: element.tags?.operator || element.tags?.brand,
        address: address || undefined,
        source: "openstreetmap",
        statusFlag: (element as any).statusFlag || "green" // statusFlag comes from API
      };
    });

    return atmLocations;
  } catch (error) {
    console.error("Error fetching from Overpass:", error);
    throw error;
  }
}

/**
 * Fetches ATM locations from Google Places API via our Next.js API route
 * This avoids CORS issues by proxying the request through our backend
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Search radius in meters
 * @returns Array of ATM locations
 */
async function fetchFromGooglePlaces(
  lat: number,
  lon: number,
  radius: number,
): Promise<ATMLocation[]> {
  try {
    // Call our Next.js API route instead of Google directly (avoids CORS)
    const url = `/api/atm?lat=${lat}&lon=${lon}&radius=${radius}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    return data.results.map((place: any) => ({
      id: `google-${place.place_id}`,
      lat: place.geometry.location.lat,
      lon: place.geometry.location.lng,
      name: place.name,
      operator: place.name,
      address: place.vicinity,
      source: "google",
      statusFlag: place.statusFlag || "green",
    }));
  } catch (error) {
    console.error("Error fetching from Google Places:", error);
    return [];
  }
}

/**
 * Main function to fetch ATM locations - prioritizes Google Places API
 * @param lat - Center latitude
 * @param lon - Center longitude
 * @param radius - Search radius in meters (default: 1000m = 5km)
 * @param googleApiKey - Google Places API key (required for best results)
 * @returns Array of ATM locations
 */
export async function fetchATMLocations(
  lat: number,
  lon: number,
  radius: number = 1000,
  googleApiKey?: string,
): Promise<ATMLocation[]> {
  try {
    let results: ATMLocation[] = [];
    let googleResults: ATMLocation[] = [];
    let overpassResults: ATMLocation[] = [];

    // Primary: Always try Google Places API first (backend will check for API key)
    try {
      googleResults = await fetchFromGooglePlaces(lat, lon, radius);
      results.push(...googleResults);
    } catch (error) {
      console.warn(
        "Google Places API failed, falling back to OpenStreetMap:",
        error,
      );
    }

    // Fallback: Only use OpenStreetMap if Google Places failed or returned no results
    if (googleResults.length == 0) {
      try {
        overpassResults = await fetchFromOverpass(lat, lon, radius);
        results.push(...overpassResults);
      } catch (error) {
        console.error("OpenStreetMap API also failed:", error);
        throw new Error("Both Google Places and OpenStreetMap APIs failed");
      }
    } else {
    }

    // Remove duplicates based on proximity (within 50 meters)
    const uniqueResults = removeDuplicates(results, 50);

    if (uniqueResults.length === 0) {
      throw new Error("No ATM locations found in this area");
    }

    return uniqueResults;
  } catch (error) {
    console.error("Error fetching ATM locations:", error);
    throw error;
  }
}

/**
 * Remove duplicate ATM locations based on proximity
 * @param locations - Array of ATM locations
 * @param thresholdMeters - Distance threshold in meters
 * @returns Array of unique ATM locations
 */
function removeDuplicates(
  locations: ATMLocation[],
  thresholdMeters: number,
): ATMLocation[] {
  const unique: ATMLocation[] = [];

  for (const location of locations) {
    const isDuplicate = unique.some((existing) => {
      const distance = calculateDistance(
        location.lat,
        location.lon,
        existing.lat,
        existing.lon,
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
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
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
      reject(new Error("Geolocation is not supported by your browser"));
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
      },
    );
  });
}
