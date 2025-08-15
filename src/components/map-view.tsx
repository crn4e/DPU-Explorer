'use client';
import type { Location } from '@/lib/types';
import LocationCard from './location-card';
import {
  MapPin,
} from 'lucide-react';

interface MapViewProps {
  selectedLocation: Location | null;
  locations: Location[];
  onSelectLocation: (location: Location) => void;
}

export default function MapView({
  selectedLocation,
  locations,
  onSelectLocation,
}: MapViewProps) {
  return (
    <div className="relative h-full min-h-[calc(100svh-3.5rem)] w-full md:min-h-screen">
      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
        <div className="relative h-full w-full">
          {/* Placeholder for Google Maps */}
          <div className="h-full w-full bg-gray-300" />
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onSelectLocation(loc)}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                // Positions are simplified for demo purposes
                top: `${(loc.lat - 13.85) * 500 + 50}%`,
                left: `${(loc.lng - 100.56) * 500 + 50}%`,
              }}
              aria-label={`Select ${loc.name}`}
            >
              <MapPin
                className={`h-8 w-8 transition-all duration-300 ${
                  selectedLocation?.id === loc.id
                    ? 'text-primary scale-125 -translate-y-2 fill-primary/20'
                    : 'text-muted-foreground/50 hover:text-primary'
                }`}
              />
            </button>
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl bg-background/80 p-2 text-center text-sm text-muted-foreground backdrop-blur-sm">
            Interactive map placeholder
          </div>
        </div>
      </div>
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex items-start justify-end p-4 transition-all duration-500 md:items-end ${
          selectedLocation ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {selectedLocation && (
          <div className="pointer-events-auto w-full max-w-sm">
            <LocationCard location={selectedLocation} />
          </div>
        )}
      </div>
    </div>
  );
}
