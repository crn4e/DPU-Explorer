
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { locations as initialLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import MapView from '@/components/map-view';
import LocationCard from '@/components/location-card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';


function EditLocationSheet({
  location,
  onSave,
  isOpen,
  onOpenChange,
}: {
  location: Location;
  onSave: (updatedLocation: Location) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [formData, setFormData] = useState(location);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(location);
  }, [location]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handlePositionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ 
        ...prev, 
        mapPosition: { 
            ...prev.mapPosition, 
            [id]: Number(value) 
        } 
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      onSave(formData);
      setIsSaving(false);
      onOpenChange(false); // Close sheet after saving
    }, 1000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit: {location.name}</SheetTitle>
        </SheetHeader>
        <div className="grid max-h-[calc(100vh-150px)] gap-4 overflow-y-auto p-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} rows={4} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.image} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="announcement">Announcement</Label>
                <Textarea id="announcement" value={formData.announcement || ''} onChange={handleChange} rows={2} />
            </div>
            <div className="space-y-2">
                <Label>Map Position</Label>
                <div className="grid grid-cols-2 gap-2">
                    <div className='flex items-center gap-2'>
                        <Label htmlFor="x" className="text-sm">X:</Label>
                        <Input id="x" type="number" value={formData.mapPosition.x} onChange={handlePositionChange} />
                    </div>
                    <div className='flex items-center gap-2'>
                        <Label htmlFor="y" className="text-sm">Y:</Label>
                        <Input id="y" type="number" value={formData.mapPosition.y} onChange={handlePositionChange} />
                    </div>
                </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
                Editing opening hours is not available in this demo.
            </p>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


export default function EditMapPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locations, setLocations] = useState(initialLocations);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user && sessionStorage.getItem('dpu-admin-auth') === 'true') {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('dpu-admin-auth');
            router.push('/admin/login');
        }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSaveLocation = (updatedLocation: Location) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
    setSelectedLocation(updatedLocation); // Update selected location to show new data
    toast({
      title: 'Location Updated',
      description: `${updatedLocation.name} has been saved successfully.`,
    });
  };

  const handleSelectLocation = (location: Location | null) => {
    setSelectedLocation(location);
    if(isSheetOpen) {
        setIsSheetOpen(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying authentication...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen">
      <MapView
        selectedLocation={selectedLocation}
        locations={locations}
        onSelectLocation={handleSelectLocation}
      />
      
      {/* Location Card with Edit Button */}
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex items-start justify-end p-4 transition-all duration-500 md:items-end ${
          selectedLocation && !isSheetOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {selectedLocation && (
          <div className="pointer-events-auto w-full max-w-sm">
            <div className="relative">
                <LocationCard location={selectedLocation} />
                <Button 
                    size="icon" 
                    className="absolute top-4 right-4 rounded-full"
                    onClick={() => setIsSheetOpen(true)}
                >
                    <Edit className="h-4 w-4"/>
                </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Sheet */}
      {selectedLocation && (
        <EditLocationSheet
          location={selectedLocation}
          onSave={handleSaveLocation}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </div>
  );
}
