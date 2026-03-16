// Type definitions for ATM data and application state

export interface ATMLocation {
  id: string;
  lat: number;
  lon: number;
  name?: string;
  operator?: string;
  address?: string;
}

export interface UserLocation {
  lat: number;
  lon: number;
}

export interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: {
    amenity?: string;
    operator?: string;
    name?: string;
    brand?: string;
    atm?: string;
    'addr:street'?: string;
    'addr:city'?: string;
  };
  center?: {
    lat: number;
    lon: number;
  };
}

export interface OverpassResponse {
  elements: OverpassElement[];
}
