'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ATMLocation, UserLocation } from '../types/atm';

interface MapViewProps {
  userLocation: UserLocation | null;
  atmLocations: ATMLocation[];
  onATMClick: (atm: ATMLocation) => void;
}

export default function MapView({ userLocation, atmLocations, onATMClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const atmMarkersRef = useRef<L.Marker[]>([]);
  const boundsSetRef = useRef<boolean>(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Bangladesh
    const map = L.map(mapContainerRef.current, {
      center: [23.8103, 90.4125], // Dhaka, Bangladesh
      zoom: 13,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create custom icon for user location
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative;">
          <div style="
            width: 20px;
            height: 20px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 40px;
            height: 40px;
            background-color: rgba(59, 130, 246, 0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Add user marker
    const marker = L.marker([userLocation.lat, userLocation.lon], {
      icon: userIcon,
    }).addTo(mapRef.current);

    marker.bindPopup('<b>Your Location</b>').openPopup();
    userMarkerRef.current = marker;

    // Center map on user location
    mapRef.current.setView([userLocation.lat, userLocation.lon], 14);
  }, [userLocation]);

  // Update ATM markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing ATM markers
    atmMarkersRef.current.forEach(marker => marker.remove());
    atmMarkersRef.current = [];

    // Create custom icon for ATM locations
    const atmIcon = L.divIcon({
      className: 'custom-atm-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background-color: #10b981;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 14px;
        ">
          $
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Add ATM markers
    atmLocations.forEach(atm => {
      const marker = L.marker([atm.lat, atm.lon], {
        icon: atmIcon,
      }).addTo(mapRef.current!);

      // Create popup content
      const popupContent = `
        <div style="min-width: 150px;">
          <b>${atm.operator || 'ATM'}</b><br/>
          ${atm.name ? `${atm.name}<br/>` : ''}
          <small>Click marker for details</small>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', (e) => {
        // Prevent default map behavior
        L.DomEvent.stopPropagation(e);
        
        // Close the popup
        marker.closePopup();
        
        // Call the ATM click handler to open sidebar
        onATMClick(atm);
      });

      atmMarkersRef.current.push(marker);
    });

    // Fit bounds to show all ATMs only once when first loaded
    if (atmLocations.length > 0 && userLocation && !boundsSetRef.current) {
      const bounds = L.latLngBounds(
        atmLocations.map(atm => [atm.lat, atm.lon])
      );
      bounds.extend([userLocation.lat, userLocation.lon]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      boundsSetRef.current = true;
    }
  }, [atmLocations, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Loading indicator */}
      {atmLocations.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm text-gray-700">Loading ATM locations...</p>
        </div>
      )}

      {/* ATM count badge */}
      {atmLocations.length > 0 && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm font-semibold text-gray-700">
            {atmLocations.length} ATM{atmLocations.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      {/* Add pulse animation style */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
