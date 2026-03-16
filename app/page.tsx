'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ATMLocation, UserLocation } from './types/atm';
import { fetchATMLocations, getUserLocation } from './utils/atmService';
import Sidebar from './components/Sidebar';
import LocationSearch from './components/LocationSearch';

const MapView = dynamic(() => import('./components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [atmLocations, setAtmLocations] = useState<ATMLocation[]>([]);
  const [selectedATM, setSelectedATM] = useState<ATMLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showApiKeyInfo, setShowApiKeyInfo] = useState(false);
  const [pinnedLocation, setPinnedLocation] = useState<{ lat: number; lon: number } | null>(null);

  const hasGoogleApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;

  useEffect(() => {
    requestLocationAndFetchATMs();
  }, []);

  const requestLocationAndFetchATMs = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setLocationPermission('granted');

      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      const atms = await fetchATMLocations(location.lat, location.lon, 1000, googleApiKey);
      setAtmLocations(atms);
      
      // Show API key info if not configured
      if (!googleApiKey) {
        setTimeout(() => setShowApiKeyInfo(true), 2000);
      }
    } catch (err) {
      console.error('Error:', err);
      
      if (err instanceof GeolocationPositionError) {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationPermission('denied');
          setError('Location permission denied. Using default location (Dhaka, Bangladesh).');
          loadDefaultLocation();
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Location unavailable. Using default location (Dhaka, Bangladesh).');
          loadDefaultLocation();
        } else {
          setError('Location request timeout. Using default location (Dhaka, Bangladesh).');
          loadDefaultLocation();
        }
      } else {
        setError('Failed to load ATM locations. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultLocation = async () => {
    const defaultLocation = { lat: 23.8103, lon: 90.4125 };
    setUserLocation(defaultLocation);
    
    try {
      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      const atms = await fetchATMLocations(defaultLocation.lat, defaultLocation.lon, 1000, googleApiKey);
      setAtmLocations(atms);
    } catch (err) {
      console.error('Error fetching ATMs:', err);
    }
  };

  const handleATMClick = (atm: ATMLocation) => {
    setSelectedATM(atm);
  };

  const handleCloseSidebar = () => {
    setSelectedATM(null);
  };

  const retryLocationRequest = () => {
    requestLocationAndFetchATMs();
  };

  const handleCustomLocationSearch = async (lat: number, lon: number, locationName: string) => {
    setIsLoading(true);
    setError(null);
    setSelectedATM(null);
    setPinnedLocation(null);

    try {
      const customLocation = { lat, lon };
      setUserLocation(customLocation);

      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      const atms = await fetchATMLocations(lat, lon, 1000, googleApiKey);
      setAtmLocations(atms);

      console.log(`✓ Searched location: ${locationName}`);
    } catch (err) {
      console.error('Error fetching ATMs at custom location:', err);
      setError('Failed to load ATM locations at this location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationPinDrop = (lat: number, lon: number) => {
    setPinnedLocation({ lat, lon });
  };

  const searchATMsAtPinnedLocation = async () => {
    if (!pinnedLocation) return;

    setIsLoading(true);
    setError(null);
    setSelectedATM(null);

    try {
      setUserLocation(pinnedLocation);

      const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
      const atms = await fetchATMLocations(pinnedLocation.lat, pinnedLocation.lon, 1000, googleApiKey);
      setAtmLocations(atms);

      console.log(`✓ Searched pinned location: ${pinnedLocation.lat}, ${pinnedLocation.lon}`);
      setPinnedLocation(null);
    } catch (err) {
      console.error('Error fetching ATMs at pinned location:', err);
      setError('Failed to load ATM locations at this location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <header className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg z-10">
        <div className="px-4 py-3 md:px-6 md:py-4">
          <h1 className="text-xl md:text-2xl font-bold">Taka Ache?</h1>
          <p className="text-xs md:text-sm text-emerald-100 mt-1">Find nearby ATMs and current status</p>
        </div>
      </header>

      <div className="absolute top-[72px] md:top-[80px] left-0 right-0 bottom-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-700 font-semibold">Loading ATM locations...</p>
              <p className="text-gray-500 text-sm mt-2">Requesting location permission</p>
            </div>
          </div>
        ) : (
          <MapView
            userLocation={userLocation}
            atmLocations={atmLocations}
            onATMClick={handleATMClick}
            onLocationPinDrop={handleLocationPinDrop}
          />
        )}
      </div>

      {/* Location Search Component */}
      <LocationSearch 
        onSearch={handleCustomLocationSearch}
        isLoading={isLoading}
      />

      {/* Search ATMs at Pinned Location Button */}
      {pinnedLocation && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2" style={{ zIndex: 1000 }}>
          <button
            onClick={searchATMsAtPinnedLocation}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-full shadow-2xl transition-all duration-200 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Search ATMs Here</span>
          </button>
        </div>
      )}

      {!hasGoogleApiKey && showApiKeyInfo && (
        <div className="absolute top-[88px] md:top-[96px] left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-20">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 mb-1">Get More ATM Coverage!</p>
              <p className="text-sm text-blue-800">
                Add a free Google Places API key to see 5-10x more ATMs. 
                <a href="https://github.com/yourusername/taka-ache-frontned/blob/main/GOOGLE_PLACES_SETUP.md" target="_blank" rel="noopener noreferrer" className="underline font-semibold ml-1">
                  Setup Guide
                </a>
              </p>
            </div>
            <button
              onClick={() => setShowApiKeyInfo(false)}
              className="ml-3 text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-[88px] md:top-[96px] left-4 right-4 md:left-auto md:right-4 md:w-96 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg z-20">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-yellow-800">{error}</p>
              {locationPermission === 'denied' && (
                <button
                  onClick={retryLocationRequest}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Retry
                </button>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-3 text-yellow-600 hover:text-yellow-800"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Sidebar
        selectedATM={selectedATM}
        userLocation={userLocation}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}
