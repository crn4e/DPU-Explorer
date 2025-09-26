'use client';
import type { Location } from '@/lib/types';
import LocationCard from './location-card';
import {
  MapPin,
} from 'lucide-react';
import Image from 'next/image';
import { useRef, useState, MouseEvent as ReactMouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface MapViewProps {
  selectedLocation: Location | null;
  locations: Location[];
  onSelectLocation: (location: Location | null) => void;
  onMapRepositionClick?: (e: ReactMouseEvent<HTMLDivElement>) => void;
  isRepositioning?: boolean;
}

export default function MapView({
  selectedLocation,
  locations,
  onSelectLocation,
  onMapRepositionClick,
  isRepositioning = false,
}: MapViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });
    const didDragRef = useRef(false);


  const handleMouseDown = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (mapContainerRef.current) {
        if (isRepositioning) return;
        e.preventDefault();
        didDragRef.current = false;
        setIsDragging(true);
        setStartPos({
            x: e.pageX,
            y: e.pageY,
        });
        setScrollPos({
            left: mapContainerRef.current.scrollLeft,
            top: mapContainerRef.current.scrollTop,
        });
    }
  };

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isDragging && mapContainerRef.current) {
        e.preventDefault();
        if(!didDragRef.current) didDragRef.current = true;

        const dx = e.pageX - startPos.x;
        const dy = e.pageY - startPos.y;

        mapContainerRef.current.scrollLeft = scrollPos.left - dx;
        mapContainerRef.current.scrollTop = scrollPos.top - dy;
    }
  };
  
  const handleMouseUp = (e: ReactMouseEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (didDragRef.current) {
      e.stopPropagation();
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };
  
  const handleMapClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (isRepositioning) {
        onMapRepositionClick?.(e);
        return;
    }
    if (!didDragRef.current) {
      onSelectLocation(null);
    }
    didDragRef.current = false;
  };

  const handlePinClick = (e: React.MouseEvent, loc: Location) => {
    e.stopPropagation(); 
    if (isRepositioning) return;
    onSelectLocation(loc);
  };
  
  return (
    <div 
        ref={mapContainerRef}
        className={cn(
            "relative h-full min-h-[calc(100svh-3.5rem)] w-full md:min-h-screen bg-white overflow-auto focus:outline-none",
            isDragging && "cursor-grabbing",
            isRepositioning ? "cursor-crosshair" : "cursor-grab"
        )}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
    >
        <div className="relative w-[150%] max-w-[1400px] lg:w-[120%] xl:w-full mx-auto">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}> 
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
                        className={cn(
                            "absolute transform -translate-x-1/2 -translate-y-full focus:outline-none transition-all duration-300",
                            isRepositioning && selectedLocation?.id !== loc.id && "opacity-30"
                        )}
                        style={{
                            top: `${loc.mapPosition.y}%`,
                            left: `${loc.mapPosition.x}%`,
                        }}
                        aria-label={`Select ${loc.name}`}
                        disabled={isRepositioning}
                        >
                        <MapPin
                            className={cn(`h-8 w-8 drop-shadow-lg`,
                                selectedLocation?.id === loc.id
                                ? 'text-primary scale-125 fill-primary/20'
                                : 'text-black/60 hover:text-primary fill-white/80',
                                isRepositioning && selectedLocation?.id === loc.id && 'animate-pulse'
                            )}
                        />
                        </button>
                    ))}
                </div>
            </div>
        </div>

      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex items-start justify-end p-4 transition-all duration-500 md:items-end ${
          selectedLocation && !isRepositioning ? 'opacity-100' : 'opacity-0'
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
