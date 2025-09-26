'use client';

import { useEffect, useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { locations as initialLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, UploadCloud, MapPin, Move } from 'lucide-react';
import { auth, storage } from '@/lib/firebase';
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
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';


function EditLocationSheet({
  location,
  onSave,
  isOpen,
  onOpenChange,
  onEnterRepositionMode,
}: {
  location: Location | null;
  onSave: (updatedLocation: Location) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onEnterRepositionMode: () => void;
}) {
  const [formData, setFormData] = useState<Location | null>(location);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setFormData(location);
    setUploadProgress(0);
    setIsUploading(false);
  }, [location]);

  if (!formData) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => prev ? ({ ...prev, [id]: value }) : null);
  };

  const handlePositionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target;
    const numValue = Number(value);
     if (isNaN(numValue)) return;
    setFormData((prev) => prev ? ({ 
        ...prev, 
        mapPosition: { 
            ...prev.mapPosition, 
            [id]: numValue, 
        } 
    }) : null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const storageRef = ref(storage, `locations/${formData.id}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        toast({
          title: "Upload Failed",
          description: "Could not upload the new image. Please try again.",
          variant: "destructive",
        });
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFormData((prev) => prev ? ({ ...prev, image: downloadURL }) : null);
          setIsUploading(false);
           toast({
            title: "Upload Successful",
            description: "New image is ready to be saved.",
          });
        });
      }
    );
  };

  const handleSave = () => {
    if (!formData) return;
    setIsSaving(true);
    onSave(formData);
    setTimeout(() => {
      setIsSaving(false);
      onOpenChange(false);
    }, 500)
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit: {location?.name}</SheetTitle>
        </SheetHeader>
        <div className="grid max-h-[calc(100vh-150px)] gap-4 overflow-y-auto p-4">
            <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                 {isUploading ? (
                  <div className="space-y-2">
                    <Button variant="outline" disabled>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </Button>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}% complete</p>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Change Image
                  </Button>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={handleChange} rows={4} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="announcement">Announcement</Label>
                <Textarea id="announcement" value={formData.announcement || ''} onChange={handleChange} rows={2} />
            </div>
            <div className="space-y-2">
                <Label>Map Position</Label>
                 <Button variant="outline" onClick={onEnterRepositionMode} className='w-full'>
                    <Move className="mr-2 h-4 w-4" />
                    Set Position on Map
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <div className='flex items-center gap-2'>
                        <Label htmlFor="x" className="text-sm">X (%):</Label>
                        <Input id="x" type="number" value={formData.mapPosition.x.toFixed(2)} onChange={handlePositionChange} />
                    </div>
                    <div className='flex items-center gap-2'>
                        <Label htmlFor="y" className="text-sm">Y (%):</Label>
                        <Input id="y" type="number" value={formData.mapPosition.y.toFixed(2)} onChange={handlePositionChange} />
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
          <Button onClick={handleSave} disabled={isSaving || isUploading}>
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
  const [isRepositioning, setIsRepositioning] = useState(false);
  
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
    console.log("Saving (locally):", updatedLocation);
    setLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
    setSelectedLocation(updatedLocation);
    toast({
      title: 'Location Updated',
      description: `${updatedLocation.name} has been saved successfully.`,
    });
  };

  const handleSelectLocation = (location: Location | null) => {
    if (isRepositioning) return;
    setSelectedLocation(location);
    if(isSheetOpen) {
        setIsSheetOpen(false);
    }
  }

  const handleMapRepositionClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isRepositioning || !selectedLocation) return;

    const mapImage = e.currentTarget.querySelector('img');
    if (!mapImage) return;

    const rect = mapImage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newXPercent = (x / rect.width) * 100;
    const newYPercent = (y / rect.height) * 100;

    const updatedLocation = {
      ...selectedLocation,
      mapPosition: { x: newXPercent, y: newYPercent },
    };

    setSelectedLocation(updatedLocation);
    setLocations((prev) => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
    
    setIsRepositioning(false); // Exit repositioning mode
    setIsSheetOpen(true); // Re-open the sheet

    toast({
        title: "Position Updated",
        description: "Click 'Save Changes' to confirm the new location.",
    });
  };

  const enterRepositionMode = () => {
    setIsSheetOpen(false);
    setIsRepositioning(true);
    toast({
      title: "Repositioning Mode",
      description: "Click on the map to set the new location for the pin.",
    });
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
    <div className={cn("relative h-screen w-screen", isRepositioning && "cursor-crosshair")}>
       {isRepositioning && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4 text-white animate-in fade-in-0">
          <div className='text-center'>
            <MapPin className="mx-auto h-12 w-12 animate-bounce" />
            <h2 className="mt-4 text-2xl font-bold">Click on the map to place the pin</h2>
            <p className="text-lg">You are moving: {selectedLocation?.name}</p>
            <Button variant="secondary" className="mt-4" onClick={() => {
              setIsRepositioning(false);
              setIsSheetOpen(true);
            }}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <MapView
        selectedLocation={selectedLocation}
        locations={locations}
        onSelectLocation={handleSelectLocation}
        onMapRepositionClick={handleMapRepositionClick}
        isRepositioning={isRepositioning}
      />
      
      <div
        className={`pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex items-start justify-end p-4 transition-all duration-500 md:items-end ${
          selectedLocation && !isSheetOpen && !isRepositioning ? 'opacity-100' : 'opacity-0'
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

      <EditLocationSheet
        location={selectedLocation}
        onSave={handleSaveLocation}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onEnterRepositionMode={enterRepositionMode}
      />
    </div>
  );
}
