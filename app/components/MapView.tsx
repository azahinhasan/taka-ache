'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ATMLocation, UserLocation } from '../types/atm';

interface MapViewProps {
  userLocation: UserLocation | null;
  atmLocations: ATMLocation[];
  onATMClick: (atm: ATMLocation) => void;
  onLocationPinDrop?: (lat: number, lon: number) => void;
}

export default function MapView({ userLocation, atmLocations, onATMClick, onLocationPinDrop }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const atmMarkersRef = useRef<L.Marker[]>([]);
  const boundsSetRef = useRef<boolean>(false);
  const customPinRef = useRef<L.Marker | null>(null);

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

    // Add click event to drop custom location pin
    map.on('click', (e) => {
      if (onLocationPinDrop) {
        const { lat, lng } = e.latlng;
        
        // Remove existing custom pin
        if (customPinRef.current) {
          customPinRef.current.remove();
        }

        // Create draggable custom pin
        const customIcon = L.divIcon({
          className: 'custom-pin-marker',
          html: `
            <div style="position: relative; z-index: 1000;">
              <div style="
                width: 30px;
                height: 30px;
                background-color: #ef4444;
                border: 3px solid white;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                box-shadow: 0 3px 10px rgba(0,0,0,0.4);
              "></div>
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(45deg);
                width: 10px;
                height: 10px;
                background-color: white;
                border-radius: 50%;
              "></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const customPin = L.marker([lat, lng], {
          icon: customIcon,
          draggable: true,
          zIndexOffset: 1000,
        }).addTo(map);

        customPin.bindPopup('<b>Custom Location</b><br/>Drag to adjust or click "Search ATMs Here"');

        // Handle drag end
        customPin.on('dragend', () => {
          const position = customPin.getLatLng();
          onLocationPinDrop(position.lat, position.lng);
        });

        customPinRef.current = customPin;
        onLocationPinDrop(lat, lng);
      }
    });

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [onLocationPinDrop]);

  // Update user location marker
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    // Check if marker exists and location hasn't changed
    if (userMarkerRef.current) {
      const currentPos = userMarkerRef.current.getLatLng();
      if (currentPos.lat === userLocation.lat && currentPos.lng === userLocation.lon) {
        // Location hasn't changed, don't recreate marker
        return;
      }
      // Location changed, remove old marker
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

    marker.bindPopup('<b>Your Location</b>');
    userMarkerRef.current = marker;

    // Only center on first load, not when user location updates
    if (!boundsSetRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lon], 14);
    }
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

    // Only fit bounds on initial load, not on subsequent searches
    // This prevents auto zoom-out when clicking ATMs after searching
    if (atmLocations.length > 0 && userLocation && !boundsSetRef.current) {
      const bounds = L.latLngBounds(
        atmLocations.map(atm => [atm.lat, atm.lon])
      );
      bounds.extend([userLocation.lat, userLocation.lon]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      boundsSetRef.current = true;
    } else if (atmLocations.length > 0 && userLocation) {
      // On subsequent searches, just center on user location without zooming out
      mapRef.current.setView([userLocation.lat, userLocation.lon], mapRef.current.getZoom());
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
