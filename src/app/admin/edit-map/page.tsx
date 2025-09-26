'use client';

import { useEffect, useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Location, LocationCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, UploadCloud, MapPin, Move, ArrowLeft, PlusCircle } from 'lucide-react';
import { auth, storage, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import MapView from '@/components/map-view';
import LocationCard from '@/components/location-card';
import LocationList from '@/components/location-list';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, setDoc, collection, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';

const categories: (LocationCategory | 'All')[] = [
  'All',
  'Academic',
  'Food',
  'Recreation',
  'Services',
];


function AddLocationSheet({
    isOpen,
    onOpenChange,
    onSave,
    newPosition
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (newLocation: Omit<Location, 'id'>) => void;
    newPosition: { x: number; y: number };
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<LocationCategory>('Services');
    const [announcement, setAnnouncement] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async () => {
        if (!name || !description) {
            toast({
                title: 'Missing Information',
                description: 'Please fill out the name and description.',
                variant: 'destructive',
            });
            return;
        }
        setIsSaving(true);
        try {
            const newLocation: Omit<Location, 'id'> = {
                name,
                description,
                category,
                announcement,
                mapPosition: newPosition,
                // Default values for new locations
                image: 'https://placehold.co/600x400.png',
                imageHint: 'placeholder',
                hours: {
                    Monday: { open: '08:00', close: '20:00' },
                    Tuesday: { open: '08:00', close: '20:00' },
                    Wednesday: { open: '08:00', close: '20:00' },
                    Thursday: { open: '08:00', close: '20:00' },
                    Friday: { open: '08:00', close: '18:00' },
                    Saturday: null,
                    Sunday: null,
                },
            };
            onSave(newLocation);
            toast({
                title: 'Location Added',
                description: `${name} has been added successfully.`,
            });
        } catch (error) {
            console.error("Error saving new location:", error);
            toast({
                title: "Save Failed",
                description: "Could not save the new location. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
            onOpenChange(false);
            // Reset form
            setName('');
            setDescription('');
            setCategory('Services');
            setAnnouncement('');
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Add New Location</SheetTitle>
                </SheetHeader>
                <div className="grid max-h-[calc(100vh-150px)] gap-4 overflow-y-auto p-4">
                    <div className="space-y-2">
                        <Label>Map Position</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <Input value={`X: ${newPosition.x.toFixed(2)}%`} disabled />
                            <Input value={`Y: ${newPosition.y.toFixed(2)}%`} disabled />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-name">Name</Label>
                        <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-category">Category</Label>
                        <Select value={category} onValueChange={(value: LocationCategory) => setCategory(value)}>
                            <SelectTrigger id="new-category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.filter(c => c !== 'All').map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-description">Description</Label>
                        <Textarea id="new-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="new-announcement">Announcement (Optional)</Label>
                        <Textarea id="new-announcement" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={2} />
                    </div>
                </div>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </SheetClose>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Location
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

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

  const handleSave = async () => {
    if (!formData) return;
    setIsSaving(true);
    try {
        const locationRef = doc(db, 'locations', formData.id);
        await updateDoc(locationRef, { ...formData });
        onSave(formData);
        toast({
            title: 'Location Updated',
            description: `${formData.name} has been saved successfully.`,
        });
    } catch (error) {
        console.error("Error saving location:", error);
        toast({
            title: "Save Failed",
            description: "Could not save the location. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsSaving(false);
        onOpenChange(false);
    }
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [newLocationPosition, setNewLocationPosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'All'>('All');
  const mapImageWrapperRef = useRef<HTMLDivElement>(null);
  
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
  
  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        const locationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching locations: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    if(isAuthenticated){
      fetchLocations();
    }
  }, [isAuthenticated]);

  const handleSaveLocation = (updatedLocation: Location) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
    setSelectedLocation(updatedLocation); 
  };
  
  const handleAddNewLocation = async (newLocationData: Omit<Location, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'locations'), newLocationData);
        const newLocationWithId = { id: docRef.id, ...newLocationData };
        setLocations(prev => [...prev, newLocationWithId]);
        setSelectedLocation(newLocationWithId);
    } catch (error) {
        console.error("Error adding new location: ", error);
        toast({
            title: "Add Failed",
            description: "Could not add the new location. Please try again.",
            variant: "destructive",
        });
    }
  };

  const filteredLocations =
    activeCategory === 'All'
      ? locations
      : locations.filter((loc) => loc.category === activeCategory);

  const handleSelectLocation = (location: Location | null) => {
    if (isRepositioning || isAddingLocation) return;
    setSelectedLocation(location);
    if(isSheetOpen) {
        setIsSheetOpen(false); 
    }
  }

  const handleMapClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isAddingLocation && !isRepositioning) return;

    // Use the ref to the map image wrapper for accurate calculations
    const mapImageWrapper = mapImageWrapperRef.current;
    if (!mapImageWrapper) return;

    const rect = mapImageWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newXPercent = (x / rect.width) * 100;
    const newYPercent = (y / rect.height) * 100;

    if (isRepositioning && selectedLocation) {
        const updatedLocation = {
          ...selectedLocation,
          mapPosition: { x: newXPercent, y: newYPercent },
        };
        setSelectedLocation(updatedLocation);
        setLocations((prev) => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
        setIsRepositioning(false);
        setIsSheetOpen(true);
        toast({
            title: "Position Updated",
            description: "Click 'Save Changes' to confirm the new location.",
        });
    } else if (isAddingLocation) {
        setNewLocationPosition({ x: newXPercent, y: newYPercent });
        setIsAddingLocation(false);
        setIsAddSheetOpen(true);
    }
  };


  const enterRepositionMode = () => {
    setIsSheetOpen(false);
    setIsRepositioning(true);
    toast({
      title: "Repositioning Mode",
      description: "Click on the map to set the new location for the pin.",
    });
  }
  
  const enterAddLocationMode = () => {
      setSelectedLocation(null);
      setIsSheetOpen(false);
      setIsRepositioning(false);
      setIsAddingLocation(true);
      toast({
          title: "Add Location Mode",
          description: "Click on the map to place the new pin.",
      });
  }


  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying authentication...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
       <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-3">
              <Image
                  src="/Logo.jpg"
                  alt="DPU Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
              <div className="flex flex-col">
                <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">
                  Edit Map
                </h1>
                <p className="text-sm text-muted-foreground">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-4 p-2">
            <Button onClick={enterAddLocationMode} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Location
            </Button>
            <div>
              <h2 className="px-2 pb-2 font-headline text-lg font-semibold">
                Categories
              </h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <LocationList
            locations={filteredLocations}
            onSelectLocation={handleSelectLocation}
            selectedLocation={selectedLocation}
          />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            <Button variant="ghost" asChild>
              <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className={cn("relative h-full w-full", (isRepositioning || isAddingLocation) && "cursor-crosshair")}>
        {(isRepositioning || isAddingLocation) && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-4 text-white animate-in fade-in-0">
            <div className='text-center'>
                <MapPin className="mx-auto h-12 w-12 animate-bounce" />
                <h2 className="mt-4 text-2xl font-bold">
                    {isAddingLocation ? 'Click on the map to place the new pin' : 'Click on the map to place the pin'}
                </h2>
                <p className="text-lg">
                    {isRepositioning ? `You are moving: ${selectedLocation?.name}` : 'You are adding a new location.'}
                </p>
                <Button variant="secondary" className="mt-4 pointer-events-auto" onClick={() => {
                    setIsRepositioning(false);
                    setIsAddingLocation(false);
                    if (selectedLocation) setIsSheetOpen(true);
                }}>
                Cancel
                </Button>
            </div>
            </div>
        )}
        <MapView
            mapImageWrapperRef={mapImageWrapperRef}
            selectedLocation={selectedLocation}
            locations={filteredLocations}
            onSelectLocation={handleSelectLocation}
            onMapRepositionClick={handleMapClick}
            isRepositioning={isRepositioning || isAddingLocation}
        />
        
        <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-10 flex items-start justify-end p-4 transition-all duration-500 md:items-end ${
            selectedLocation && !isSheetOpen && !isRepositioning && !isAddingLocation ? 'opacity-100' : 'opacity-0'
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
        <AddLocationSheet
            isOpen={isAddSheetOpen}
            onOpenChange={setIsAddSheetOpen}
            onSave={handleAddNewLocation}
            newPosition={newLocationPosition}
        />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

    