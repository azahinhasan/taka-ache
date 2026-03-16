'use client';

import { useState } from 'react';

interface LocationSearchProps {
  onSearch: (lat: number, lon: number, locationName: string) => void;
  isLoading: boolean;
}

export default function LocationSearch({ onSearch, isLoading }: LocationSearchProps) {
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError('Please enter a location');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Check if input is coordinates (format: lat,lon or lat, lon)
      const coordPattern = /^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/;
      const coordMatch = searchInput.trim().match(coordPattern);

      if (coordMatch) {
        // Direct coordinates
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[2]);

        if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
          onSearch(lat, lon, `${lat}, ${lon}`);
        } else {
          setError('Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180');
        }
      } else {
        // Use Nominatim (OpenStreetMap) geocoding service - free and no API key required
        // Using proper headers to avoid 403 errors
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput + ', Bangladesh')}&limit=1&addressdetails=1`;
        
        const response = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'ATM-Locator-Bangladesh/1.0 (Contact: your-email@example.com)',
            'Referer': typeof window !== 'undefined' ? window.location.origin : '',
          }
        });

        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.length === 0) {
          setError('Location not found. Try "Dhaka" or coordinates like "23.8103, 90.4125"');
          return;
        }

        const location = data[0];
        onSearch(
          parseFloat(location.lat),
          parseFloat(location.lon),
          location.display_name
        );
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError('Failed to find location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="absolute top-[88px] md:top-[96px] left-4 right-4 md:left-4 md:right-auto md:w-96" style={{ zIndex: 1000 }}>
      <div className="bg-white rounded-lg shadow-lg p-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search location (e.g., Dhaka or 23.8103, 90.4125)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
              disabled={isLoading || isSearching}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading || isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium"
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Searching...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-600 flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          <p>💡 Try: "Gulshan, Dhaka" or coordinates "23.8103, 90.4125"</p>
        </div>
      </div>
    </div>
  );
}
