'use client';

import { ATMLocation, UserLocation } from '../types/atm';

interface SidebarProps {
  selectedATM: ATMLocation | null;
  userLocation: UserLocation | null;
  onClose: () => void;
}

export default function Sidebar({ selectedATM, userLocation, onClose }: SidebarProps) {
  if (!selectedATM) return null;

  // Function to open Google Maps navigation
  const openGoogleMapsNavigation = () => {
    if (!userLocation) {
      alert('User location not available. Please enable location services.');
      return;
    }

    const origin = `${userLocation.lat},${userLocation.lon}`;
    const destination = `${selectedATM.lat},${selectedATM.lon}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(googleMapsUrl, '_blank');
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Sidebar panel */}
      <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto" style={{ zIndex: 9999 }}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center shadow-md">
          <h2 className="text-xl font-bold">ATM Details</h2>
          <button 
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* ATM ID */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              ATM Identifier
            </h3>
            <p className="text-lg font-mono text-gray-900 break-all">
              {selectedATM.id}
            </p>
          </div>

          {/* Operator/Bank Name */}
          {selectedATM.operator && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Operator
              </h3>
              <p className="text-lg text-gray-900">
                {selectedATM.operator}
              </p>
            </div>
          )}

          {/* Name */}
          {selectedATM.name && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Name
              </h3>
              <p className="text-lg text-gray-900">
                {selectedATM.name}
              </p>
            </div>
          )}

          {/* Address */}
          {selectedATM.address && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Address
              </h3>
              <p className="text-lg text-gray-900">
                {selectedATM.address}
              </p>
            </div>
          )}

          {/* Coordinates */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Coordinates
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Latitude:</span> {selectedATM.lat.toFixed(6)}
              </p>
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Longitude:</span> {selectedATM.lon.toFixed(6)}
              </p>
            </div>
          </div>

          {/* Navigation Button */}
          <button
            onClick={openGoogleMapsNavigation}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Navigate with Google Maps</span>
          </button>

          {/* Placeholder for future details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> Additional details such as operating hours, 
              services available, and real-time status will be added in future updates.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
