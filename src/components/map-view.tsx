'use client';
import type { Location } from '@/lib/types';
import LocationCard from './location-card';
import {
  MapPin,
} from 'lucide-react';
import Image from 'next/image';

interface MapViewProps {
  selectedLocation: Location | null;
  locations: Location[];
  onSelectLocation: (location: Location | null) => void;
}

export default function MapView({
  selectedLocation,
  locations,
  onSelectLocation,
}: MapViewProps) {
  const handleMapClick = () => {
    onSelectLocation(null);
  };

  const handlePinClick = (e: React.MouseEvent, loc: Location) => {
    e.stopPropagation(); // Prevents the map click from firing
    onSelectLocation(loc);
  };
  
  return (
    <div 
        className="relative h-full min-h-[calc(100svh-3.5rem)] w-full md:min-h-screen bg-white flex items-center justify-center p-4"
        onClick={handleMapClick}
    >
        {/* Aspect Ratio Container */}
        <div className="relative w-full max-w-7xl aspect-[1.77]"> 
            <div className="absolute inset-0">
                <Image
                    src="/dpu-map.png.png"
                    alt="DPU Campus Map"
                    fill
                    style={{ objectFit: "contain" }}
                    className="pointer-events-none"
                    unoptimized
                />
                {locations.map((loc) => (
                    <button
                    key={loc.id}
                    onClick={(e) => handlePinClick(e, loc)}
                    className="absolute transform -translate-x-1/2 -translate-y-full"
                    style={{
                        top: `${loc.mapPosition.y}%`,
                        left: `${loc.mapPosition.x}%`,
                    }}
                    aria-label={`Select ${loc.name}`}
                    >
                    <MapPin
                        className={`h-8 w-8 transition-all duration-300 drop-shadow-lg ${
                        selectedLocation?.id === loc.id
                            ? 'text-primary scale-125 fill-primary/20'
                            : 'text-black/60 hover:text-primary fill-white/80'
                        }`}
                    />
                    </button>
                ))}
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
