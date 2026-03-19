'use client';

import { useEffect, useRef, memo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ATMLocation, UserLocation } from '../types/atm';
import { Language, getTranslation } from '../utils/translations';

interface MapViewProps {
  userLocation: UserLocation | null;
  atmLocations: ATMLocation[];
  onATMClick: (atm: ATMLocation) => void;
  onLocationPinDrop?: (lat: number, lon: number) => void;
  onRefreshATMs?: () => void;
  onRecenterMap?: () => void;
  language: Language;
}

function MapViewComponent({ userLocation, atmLocations, onATMClick, onLocationPinDrop, onRefreshATMs, onRecenterMap, language }: MapViewProps) {
  const t = getTranslation(language);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const atmMarkersRef = useRef<L.Marker[]>([]);
  const boundsSetRef = useRef<boolean>(false);
  const customPinRef = useRef<L.Marker | null>(null);
  const prevAtmLocationsRef = useRef<ATMLocation[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Create map centered on Bangladesh
    const map = L.map(mapContainerRef.current, {
      center: [23.8103, 90.4125], // Dhaka, Bangladesh
      zoom: 13,
      zoomControl: true,
    });

    // Add map tiles - using CartoDB for better localhost support
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Set custom cursor to pin icon by default
    map.getContainer().style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23ef4444' stroke='white' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3' fill='white'/%3E%3C/svg%3E") 12 24, crosshair`;

    // Change cursor to grabbing hand when panning
    map.on('mousedown', (e) => {
      if (e.originalEvent.button === 2 || e.originalEvent.buttons === 1) {
        map.getContainer().style.cursor = 'grabbing';
      }
    });

    map.on('mouseup', () => {
      map.getContainer().style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%23ef4444' stroke='white' stroke-width='2'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3' fill='white'/%3E%3C/svg%3E") 12 24, crosshair`;
    });

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

    // Add user marker with high z-index to ensure visibility
    const marker = L.marker([userLocation.lat, userLocation.lon], {
      icon: userIcon,
      zIndexOffset: 500,
    }).addTo(mapRef.current);

    marker.bindPopup('<b>Your Location</b>');
    userMarkerRef.current = marker;

    console.log('User marker created at:', userLocation.lat, userLocation.lon);

    // Only center on first load, not when user location updates
    if (!boundsSetRef.current) {
      mapRef.current.setView([userLocation.lat, userLocation.lon], 14);
    }
  }, [userLocation]);

  // Update ATM markers
  useEffect(() => {
    if (!mapRef.current) return;

    console.log('ATM markers useEffect triggered. atmLocations.length:', atmLocations.length);

    // Check if atmLocations actually changed (not just reference)
    const prevAtms = prevAtmLocationsRef.current;
    const hasChanged = prevAtms.length === 0 ||
      atmLocations.length !== prevAtms.length ||
      atmLocations.some((atm, idx) => atm.id !== prevAtms[idx]?.id);

    // Check if markers are already created and data hasn't changed
    const markersAlreadyExist = atmMarkersRef.current.length === atmLocations.length;

    if (!hasChanged && markersAlreadyExist && atmMarkersRef.current.length > 0) {
      console.log('Skipping marker update - atmLocations content unchanged and markers exist');
      return;
    }

    // Only clear if we need to recreate
    if (atmMarkersRef.current.length > 0) {
      console.log('Clearing existing ATM markers');
      atmMarkersRef.current.forEach(marker => marker.remove());
      atmMarkersRef.current = [];
    }

    // Don't create markers if atmLocations is empty
    if (atmLocations.length === 0) {
      console.log('Skipping marker creation - atmLocations is empty');
      prevAtmLocationsRef.current = atmLocations;
      return;
    }

    console.log('Creating', atmLocations.length, 'ATM markers');

    // Add ATM markers with color-coded status
    atmLocations.forEach((atm, index) => {
      // Determine marker color based on statusFlag
      const statusColors = {
        green: '#10b981',  // Emerald green - Working fine
        orange: '#f97316', // Orange - Has issues (partially working, accepting own bank, etc.)
        red: '#ef4444'     // Red - Not working or no cash
      };
      const markerColor = statusColors[atm.statusFlag || 'green'];

      // Create custom icon with dynamic color
      const atmIcon = L.divIcon({
        className: 'custom-atm-marker',
        html: `<div style="width: 32px; height: 32px; background-color: ${markerColor}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px;">$</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([atm.lat, atm.lon], {
        icon: atmIcon,
        zIndexOffset: 100,
      }).addTo(mapRef.current!);

      console.log(`Created marker ${index + 1}/${atmLocations.length} at [${atm.lat}, ${atm.lon}]`);

      // Add tooltip for hover (desktop) and press-hold (mobile)
      const tooltipText = atm.name || atm.operator || 'ATM';
      marker.bindTooltip(tooltipText, {
        direction: 'top',
        offset: [0, -16],
        opacity: 0.9,
        className: 'atm-tooltip'
      });

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

    console.log(`Total markers in atmMarkersRef: ${atmMarkersRef.current.length}`);

    // Update the previous reference AFTER markers are created
    // This prevents React Strict Mode double-render from skipping marker creation
    prevAtmLocationsRef.current = atmLocations;
    console.log('Markers created and reference updated');

    // Only fit bounds on initial load, not on subsequent searches
    // This prevents auto zoom-out when clicking ATMs after searching
    if (atmLocations.length > 0 && userLocation && !boundsSetRef.current) {
      const bounds = L.latLngBounds(
        atmLocations.map(atm => [atm.lat, atm.lon])
      );
      bounds.extend([userLocation.lat, userLocation.lon]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      boundsSetRef.current = true;
    }
    // Don't re-center on subsequent updates to preserve user's current view
  }, [atmLocations]);

  // Expose recenter function via callback
  useEffect(() => {
    if (onRecenterMap && mapRef.current && userLocation) {
      // This allows parent to trigger recentering
      const recenter = () => {
        if (mapRef.current && userLocation) {
          mapRef.current.setView([userLocation.lat, userLocation.lon], 15, {
            animate: true,
            duration: 1,
          });
        }
      };
      // Store the function so parent can call it
      (window as any).__mapRecenter = recenter;
    }
  }, [userLocation, onRecenterMap]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full cursor-crosshair" />
      
      {/* Loading indicator */}
      {atmLocations.length === 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm text-gray-700">{t.loadingATMs}</p>
        </div>
      )}

      {/* ATM count badge */}
      {atmLocations.length > 0 && (
        <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
          <p className="text-sm font-semibold text-gray-700">
            {t.atmCount(atmLocations.length)}
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

export default memo(MapViewComponent);
