'use client';

import {
  Building2,
  Dumbbell,
  UtensilsCrossed,
  Briefcase,
  Dot,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Location, LocationCategory } from '@/lib/types';
import { useEffect, useState } from 'react';
import { checkOpenStatus } from '@/lib/helpers';

interface LocationListProps {
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  selectedLocation: Location | null;
}

const categoryIcons: Record<LocationCategory, React.ElementType> = {
  Academic: Building2,
  Food: UtensilsCrossed,
  Recreation: Dumbbell,
  Services: Briefcase,
};

function LocationItem({ location, onSelect, isSelected }: { location: Location; onSelect: () => void; isSelected: boolean }) {
  const [status, setStatus] = useState<{isOpen: boolean | null}>({ isOpen: null });

  useEffect(() => {
    // Check status on client to use current time and avoid hydration mismatch
    setStatus(checkOpenStatus(location));
  }, [location]);

  const Icon = categoryIcons[location.category[0]] || Briefcase;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-4 rounded-lg p-3 text-left transition-colors select-none',
        isSelected
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-accent/50'
      )}
    >
      <div
        className={cn(
          'rounded-lg p-2',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="truncate font-semibold">{location.name}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          {status.isOpen !== null && (
            <>
              <Dot className={cn("mr-1 h-6 w-6", status.isOpen ? "text-green-500" : "text-red-500")} />
              <span>{status.isOpen ? 'Open' : 'Closed'}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}

export default function LocationList({
  locations,
  onSelectLocation,
  selectedLocation,
}: LocationListProps) {
  return (
    <ScrollArea className="h-[calc(100%-180px)] px-2">
      <div className="flex flex-col gap-2 p-2">
        {locations.length > 0 ? (
          locations.map((location) => (
            <LocationItem
              key={location.id}
              location={location}
              onSelect={() => onSelectLocation(location)}
              isSelected={selectedLocation?.id === location.id}
            />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <p>No locations found.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
