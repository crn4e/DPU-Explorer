'use client';
import type { Location } from '@/lib/types';
import LocationCard from './location-card';
import {
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { cn } from '@/lib/utils';

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
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
    const [didDrag, setDidDrag] = useState(false);


  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (mapContainerRef.current) {
        setDidDrag(false);
        setIsDragging(true);
        setStartPos({
            x: e.pageX - mapContainerRef.current.offsetLeft,
            y: e.pageY - mapContainerRef.current.offsetTop,
        });
        setScrollPos({
            left: mapContainerRef.current.scrollLeft,
            top: mapContainerRef.current.scrollTop,
        });
    }
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isDragging && mapContainerRef.current) {
        setDidDrag(true);
        e.preventDefault();
        const x = e.pageX - (mapContainerRef.current.offsetLeft || 0);
        const y = e.pageY - (mapContainerRef.current.offsetTop || 0);
        const walkX = (x - startPos.x) * 1.5; // Adjust scroll speed
        const walkY = (y - startPos.y) * 1.5;
        mapContainerRef.current.scrollLeft = scrollPos.left - walkX;
        mapContainerRef.current.scrollTop = scrollPos.top - walkY;
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
    // Use a timeout to reset didDrag, allowing the click event to check it first
    setTimeout(() => setDidDrag(false), 0);
  };
  
  const handleMapClick = () => {
    if (!didDrag) {
        onSelectLocation(null);
    }
  };

  const handlePinClick = (e: React.MouseEvent, loc: Location) => {
    e.stopPropagation(); // Prevents the map click from firing
    onSelectLocation(loc);
  };
  
  return (
    <div 
        ref={mapContainerRef}
        className={cn(
            "relative h-full min-h-[calc(100svh-3.5rem)] w-full md:min-h-screen bg-white overflow-auto cursor-grab",
            isDragging && "cursor-grabbing"
        )}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseUp}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
    >
        {/* Wrapper to allow scrolling beyond initial view */}
        <div className="relative w-[150%] max-w-[1400px] lg:w-[120%] xl:w-full mx-auto">
             {/* Aspect Ratio Container */}
            <div className="relative w-full aspect-[1.77]"> 
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
                        className="absolute transform -translate-x-1/2 -translate-y-full focus:outline-none"
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
