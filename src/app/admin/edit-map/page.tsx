'use client';

import { useEffect, useState, useRef, MouseEvent as ReactMouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Location, LocationCategory, DirectoryPage, RoomItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit, UploadCloud, MapPin, Move, ArrowLeft, PlusCircle, Trash2, X, Clock, ArrowRight } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { doc, setDoc, collection, getDocs, updateDoc, addDoc, deleteDoc, deleteField, getDoc } from 'firebase/firestore';
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
import { uploadImage } from '@/ai/flows/upload-image-flow';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import placeholderImages from '@/lib/placeholder-images.json';


const categories: LocationCategory[] = [
  'Academic',
  'Food',
  'Recreation',
  'Services',
];

const allCategories: (LocationCategory | 'All')[] = [
  'All',
  ...categories,
];


const daysOfWeek: (keyof NonNullable<Location['hours']>)[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


function AddLocationSheet({
    isOpen,
    onOpenChange,
    onSave,
    newPosition
}: {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (newLocation: Omit<Location, 'id'>) => Promise<void>;
    newPosition: { x: number; y: number };
}) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<LocationCategory[]>(['Services']);
    const [announcement, setAnnouncement] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
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
                image: '/default.png',
                hours: {
                    Monday: { open: '08:00', close: '20:00' },
                    Tuesday: { open: '08:00', close: '20:00' },
                    Wednesday: { open: '08:00', close: '20:00' },
                    Thursday: { open: '08:00', close: '20:00' },
                    Friday: { open: '08:00', close: '18:00' },
                    Saturday: null,
                    Sunday: null,
                },
                directoryInfo: [],
                isDeleted: false,
            };
            await onSave(newLocation);
            toast({
                title: 'Location Added',
                description: `${name} has been added successfully.`,
            });
            onOpenChange(false);
             // Reset form
            setName('');
            setDescription('');
            setCategory(['Services']);
            setAnnouncement('');
        } catch (error) {
            console.error("Error saving new location:", error);
            toast({
                title: "Save Failed",
                description: "Could not save the new location. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent>
                <form onSubmit={handleSave}>
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
                            <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} required/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-category">Category</Label>
                            <Select value={category[0]} onValueChange={(value: LocationCategory) => setCategory([value])}>
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
                            <Textarea id="new-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-announcement">Announcement (Optional)</Label>
                            <Textarea id="new-announcement" value={announcement} onChange={(e) => setAnnouncement(e.target.value)} rows={2} />
                        </div>
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Location
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}

function EditLocationSheet({
  location,
  onSave,
  onDelete,
  isOpen,
  onOpenChange,
  onEnterRepositionMode,
}: {
  location: Location | null;
  onSave: (updatedLocation: Location) => void;
  onDelete: (locationId: string, locationName: string) => void;
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
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [newCategory, setNewCategory] = useState<LocationCategory | ''>('');

  const defaultHours = {
      Monday: { open: '08:00', close: '17:00' },
      Tuesday: { open: '08:00', close: '17:00' },
      Wednesday: { open: '08:00', close: '17:00' },
      Thursday: { open: '08:00', close: '17:00' },
      Friday: { open: '08:00', close: '17:00' },
      Saturday: null,
      Sunday: null,
  };


  useEffect(() => {
    // Ensure directoryInfo and category are always arrays
    const sanitizedLocation = location ? {
        ...location,
        category: Array.isArray(location.category) ? location.category : [location.category as unknown as LocationCategory],
        directoryInfo: location.directoryInfo || []
    } : null;
    setFormData(sanitizedLocation);
    setActivePageIndex(0); 
  }, [location]);

  if (!formData || !location) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => prev ? ({ ...prev, [id]: value }) : null);
  };
  
  const addCategory = () => {
    if (newCategory && formData && !formData.category.includes(newCategory)) {
        setFormData(prev => prev ? ({ ...prev, category: [...prev.category, newCategory] }) : null);
        setNewCategory('');
    }
  };

  const removeCategory = (categoryToRemove: LocationCategory) => {
      setFormData(prev => prev ? ({ ...prev, category: prev.category.filter(c => c !== categoryToRemove) }) : null);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const dataUri = reader.result as string;
        setUploadProgress(50);
        try {
            const result = await uploadImage({ fileName: file.name, dataUri });
            setFormData((prev) => prev ? ({ ...prev, image: result.downloadUrl }) : null);
            setUploadProgress(100);
            toast({
                title: "Upload Successful",
                description: "New image is ready to be saved.",
            });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({
                title: "Upload Failed",
                description: "Could not upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };
    reader.onerror = (error) => {
        console.error("File reading error:", error);
        toast({
            title: "File Error",
            description: "Could not read the selected file.",
            variant: "destructive",
        });
        setIsUploading(false);
    };
};

  const handleHoursChange = (day: keyof NonNullable<Location['hours']>, field: 'open' | 'close', value: string) => {
      setFormData(prev => {
          if (!prev || !prev.hours) return null;
          const newHours = { ...prev.hours };
          const dayHours = newHours[day];
          if (dayHours) {
              newHours[day] = { ...dayHours, [field]: value };
          } else {
              // If it was null (closed), initialize it
              newHours[day] = { open: '00:00', close: '00:00', [field]: value };
          }
          return { ...prev, hours: newHours };
      });
  };

  const handleClosedChange = (day: keyof NonNullable<Location['hours']>, checked: boolean) => {
      setFormData(prev => {
          if (!prev || !prev.hours) return null;
          const newHours = { ...prev.hours };
          if (checked) {
              newHours[day] = null;
          } else {
              // If unchecking, set default hours
              newHours[day] = { open: '08:00', close: '17:00' };
          }
          return { ...prev, hours: newHours };
      });
  };

  const handleClearAllHours = () => {
    setFormData(prev => prev ? ({ ...prev, hours: null }) : null);
  };

  const handleAddHours = () => {
    setFormData(prev => prev ? ({ ...prev, hours: defaultHours }) : null);
  };

  const handleDirectoryPageChange = (index: number, field: 'title' | 'description' | 'imageId', value: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const newDirectoryInfo = [...(prev.directoryInfo || [])];
      newDirectoryInfo[index] = { ...newDirectoryInfo[index], [field]: value, items: newDirectoryInfo[index].items || [] };
      return { ...prev, directoryInfo: newDirectoryInfo };
    });
  }

  const handleRoomItemChange = (pageIndex: number, itemIndex: number, field: 'name' | 'details' | 'imageId', value: string) => {
      setFormData(prev => {
        if (!prev) return null;
        const newDirectoryInfo = JSON.parse(JSON.stringify(prev.directoryInfo || []));
        newDirectoryInfo[pageIndex].items[itemIndex][field] = value;
        return { ...prev, directoryInfo: newDirectoryInfo };
      });
  }

  const addRoomItem = (pageIndex: number) => {
      setFormData(prev => {
          if (!prev) return null;
          const newDirectoryInfo = JSON.parse(JSON.stringify(prev.directoryInfo || []));
          if (!newDirectoryInfo[pageIndex].items) {
              newDirectoryInfo[pageIndex].items = [];
          }
          newDirectoryInfo[pageIndex].items.push({ name: '', details: '' });
          return { ...prev, directoryInfo: newDirectoryInfo };
      });
  }

  const removeRoomItem = (pageIndex: number, itemIndex: number) => {
      setFormData(prev => {
          if (!prev) return null;
          const newDirectoryInfo = JSON.parse(JSON.stringify(prev.directoryInfo || []));
          newDirectoryInfo[pageIndex].items.splice(itemIndex, 1);
          return { ...prev, directoryInfo: newDirectoryInfo };
      });
  }

    const addDirectoryPage = () => {
        setFormData(prev => {
            if (!prev) return null;
            // A new unique ID for the page's image
            const newImageId = `${prev.id}-page-${Date.now()}`;
            const newPage: DirectoryPage = { 
                title: `Page ${(prev.directoryInfo?.length || 0) + 2}`, 
                items: [],
                imageId: newImageId,
            };
            const newDirectoryInfo = [...(prev.directoryInfo || []), newPage];
            setActivePageIndex(newDirectoryInfo.length); // Switch to the new page (index is length because of main page)
            return { ...prev, directoryInfo: newDirectoryInfo };
        });
    };

  const removeDirectoryPage = (index: number) => {
    setFormData(prev => {
        if (!prev) return null;
        const newDirectoryInfo = (prev.directoryInfo || []).filter((_, i) => i !== index);
        setActivePageIndex(Math.max(0, activePageIndex - 1)); // Go to previous or first page
        return { ...prev, directoryInfo: newDirectoryInfo };
    });
  };

  const moveDirectoryPage = (index: number, direction: 'left' | 'right') => {
    setFormData(prev => {
        if (!prev || !prev.directoryInfo) return null;
        const newDirectoryInfo = [...prev.directoryInfo];
        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newDirectoryInfo.length) return prev;

        const [movedItem] = newDirectoryInfo.splice(index, 1);
        newDirectoryInfo.splice(newIndex, 0, movedItem);

        setActivePageIndex(newIndex + 1);
        return { ...prev, directoryInfo: newDirectoryInfo };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSaving(true);
    try {
        const locationRef = doc(db, 'locations', formData.id);
        const dataToSave = { ...formData };
        if (dataToSave.hours === null) {
          (dataToSave as any).hours = deleteField();
        }
        
        await updateDoc(locationRef, dataToSave);
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

  const handleDelete = () => {
    if (!location) return;
    onDelete(location.id, location.name);
    onOpenChange(false);
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[550px]">
       <form onSubmit={handleSave}>
        <SheetHeader>
          <SheetTitle>Edit: {location?.name}</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 border-b border-border pb-2 mb-4 overflow-x-auto">
            <Button
              type="button"
              variant={activePageIndex === 0 ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePageIndex(0)}
              className="shrink-0"
            >
              Page 1
            </Button>
            {formData.directoryInfo?.map((page, index) => (
              <div key={page.imageId || index} className="flex items-center gap-1 shrink-0">
                <Button
                    type="button"
                    variant={activePageIndex === index + 1 ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActivePageIndex(index + 1)}
                    className="shrink-0"
                >
                    {page.title || `Page ${index + 2}`}
                </Button>
                <div className="flex flex-col">
                  <button type="button" onClick={() => moveDirectoryPage(index, 'left')} disabled={index === 0} className="disabled:opacity-20"><ArrowLeft className="h-3 w-3" /></button>
                  <button type="button" onClick={() => moveDirectoryPage(index, 'right')} disabled={index === formData.directoryInfo.length - 1} className="disabled:opacity-20"><ArrowRight className="h-3 w-3" /></button>
                </div>
              </div>
            ))}
            <Button onClick={addDirectoryPage} type="button" variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <PlusCircle className="h-4 w-4"/>
            </Button>
        </div>


        <div className="grid max-h-[calc(100vh-220px)] gap-4 overflow-y-auto p-1">
          {activePageIndex === 0 ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className='relative aspect-video w-full rounded-md overflow-hidden'>
                    <Image
                        src={formData.image || '/default.png'}
                        alt={formData.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                 {isUploading ? (
                  <div className="space-y-2">
                    <Button variant="outline" disabled type="button">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                    </Button>
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-xs text-muted-foreground">{uploadProgress === 100 ? 'Finalizing...' : `Uploading... ${uploadProgress}%`}</p>
                  </div>
                ) : (
                  <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Change Image
                  </Button>
                )}
            </div>
              <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange} required/>
              </div>
               <div className="space-y-2">
                <Label>Category</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {formData.category.map(cat => (
                        <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                            {cat}
                            <button type="button" onClick={() => removeCategory(cat)} className="rounded-full hover:bg-muted-foreground/20">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Select value={newCategory} onValueChange={(v) => setNewCategory(v as LocationCategory)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category to add" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.filter(c => !formData.category.includes(c)).map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={addCategory} type="button">เพิ่มรายการ</Button>
                </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="description">Description (Page 1)</Label>
                  <Textarea id="description" value={formData.description} onChange={handleChange} rows={4} required/>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="announcement">Announcement</Label>
                  <Textarea id="announcement" value={formData.announcement || ''} onChange={handleChange} rows={2} />
              </div>

               <div className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <Label>Opening Hours</Label>
                    </div>
                     {formData.hours && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" type="button" onClick={handleClearAllHours}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                     )}
                  </div>
                  {formData.hours ? (
                    daysOfWeek.map(day => (
                        <div key={day} className="grid grid-cols-6 items-center gap-2">
                            <Label htmlFor={`closed-${day}`} className="col-span-2 text-sm font-normal">{day}</Label>
                            <div className="col-span-4 grid grid-cols-3 items-center gap-2">
                                <Input
                                    type="time"
                                    value={formData.hours?.[day]?.open ?? ''}
                                    onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                                    disabled={!formData.hours || formData.hours[day] === null}
                                    className="w-full"
                                />
                                <Input
                                    type="time"
                                    value={formData.hours?.[day]?.close ?? ''}
                                    onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                                    disabled={!formData.hours || formData.hours[day] === null}
                                    className="w-full"
                                />
                                <div className="flex items-center space-x-2 justify-end">
                                    <Checkbox
                                        id={`closed-${day}`}
                                        checked={!formData.hours || formData.hours[day] === null}
                                        onCheckedChange={(checked) => handleClosedChange(day, checked as boolean)}
                                    />
                                    <Label htmlFor={`closed-${day}`} className="text-xs font-light">Closed</Label>
                                </div>
                            </div>
                        </div>
                    ))
                  ) : (
                    <Button variant="outline" type="button" onClick={handleAddHours} className="w-full">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Opening Hours
                    </Button>
                  )}
              </div>
              
              <div className="space-y-2">
                  <Label>Map Position</Label>
                  <Button variant="outline" type="button" onClick={onEnterRepositionMode} className='w-full'>
                      <Move className="mr-2 h-4 w-4" />
                      Set Position on Map
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                      <Input disabled value={`X: ${formData.mapPosition.x.toFixed(2)}%`} />
                      <Input disabled value={`Y: ${formData.mapPosition.y.toFixed(2)}%`} />
                  </div>
              </div>
            </>
          ) : (
            formData.directoryInfo && formData.directoryInfo[activePageIndex - 1] && (
              <div className="space-y-4 animate-in fade-in-0">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Editing Page: {formData.directoryInfo[activePageIndex - 1].title}</h3>
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeDirectoryPage(activePageIndex - 1)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dir-title-${activePageIndex - 1}`}>Page Title</Label>
                  <Input
                    id={`dir-title-${activePageIndex - 1}`}
                    value={formData.directoryInfo[activePageIndex - 1].title}
                    onChange={(e) => handleDirectoryPageChange(activePageIndex - 1, 'title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`dir-desc-${activePageIndex - 1}`}>Description (Optional)</Label>
                  <Textarea
                    id={`dir-desc-${activePageIndex - 1}`}
                    placeholder="A brief description for this page."
                    value={formData.directoryInfo[activePageIndex - 1].description || ''}
                    onChange={(e) => handleDirectoryPageChange(activePageIndex - 1, 'description', e.target.value)}
                    rows={3}
                  />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor={`dir-imageid-${activePageIndex-1}`}>Page Image ID</Label>
                    <Input
                        id={`dir-imageid-${activePageIndex-1}`}
                        value={formData.directoryInfo[activePageIndex - 1].imageId || ''}
                        placeholder='e.g., building-1-guest-services'
                        onChange={(e) => handleDirectoryPageChange(activePageIndex - 1, 'imageId', e.target.value)}
                    />
                </div>
                
                <div className="space-y-4">
                  <Label>Items</Label>
                  {(formData.directoryInfo[activePageIndex - 1].items || []).map((item, itemIndex) => {
                     const itemImageId = item.imageId || '';
                     const itemImageInfo = (placeholderImages as any)[location.id]?.directoryPages?.[itemImageId];
                    return (
                        <div key={itemIndex} className="relative space-y-2 rounded-md border bg-muted/50 p-4">
                            <div className="space-y-1">
                                <Label htmlFor={`item-name-${itemIndex}`} className="text-xs">ชื่อรายการ</Label>
                                <Input 
                                    id={`item-name-${itemIndex}`}
                                    placeholder="เช่น ห้อง 10522, โต๊ะ อ.สมชาย"
                                    value={item.name}
                                    onChange={(e) => handleRoomItemChange(activePageIndex - 1, itemIndex, 'name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`item-details-${itemIndex}`} className="text-xs">รายละเอียด</Label>
                                <Textarea 
                                    id={`item-details-${itemIndex}`}
                                    placeholder="เช่น รายละเอียดเพิ่มเติมเกี่ยวกับอาจารย์ หรือห้อง"
                                    value={item.details}
                                    onChange={(e) => handleRoomItemChange(activePageIndex - 1, itemIndex, 'details', e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor={`item-imageid-${itemIndex}`} className="text-xs">Item Image ID</Label>
                                <Input 
                                    id={`item-imageid-${itemIndex}`}
                                    placeholder="e.g., room-1412-photo"
                                    value={item.imageId || ''}
                                    onChange={(e) => handleRoomItemChange(activePageIndex - 1, itemIndex, 'imageId', e.target.value)}
                                />
                            </div>
                             {itemImageInfo && (
                               <div className="relative w-24 h-24 mt-2">
                                  <Image src={itemImageInfo.url} alt={item.name} layout="fill" className="rounded-md object-cover"/>
                               </div>
                            )}

                            <Button 
                                type="button"
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6 text-destructive"
                                onClick={() => removeRoomItem(activePageIndex - 1, itemIndex)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                  })}
                  <Button variant="outline" type="button" onClick={() => addRoomItem(activePageIndex - 1)} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    เพิ่มรายการ +
                  </Button>
                </div>

              </div>
            )
          )}
        </div>

        <SheetFooter className="absolute bottom-0 right-0 w-full bg-background p-6 border-t justify-between">
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" type="button">
                <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will move the
                  <span className="font-bold"> {location.name} </span>
                  location to the trash. You can restore it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Yes, move to trash
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2">
            <SheetClose asChild>
                <Button variant="outline" type="button">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </div>
        </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}


export default function EditMapPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
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
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (adminDocSnap.exists()) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
                sessionStorage.removeItem('dpu-admin-auth');
                router.push('/dev/login');
            }
        } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('dpu-admin-auth');
            router.push('/dev/login');
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
        setAllLocations(locationsData);
      } catch (error) {
        console.error("Error fetching locations: ", error);
        toast({
            title: "Error fetching locations",
            description: "Could not fetch locations from the database. Please check permissions.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if(isAuthenticated){
      fetchLocations();
    }
  }, [isAuthenticated, toast]);

  const handleSaveLocation = (updatedLocation: Location) => {
    setAllLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
    setSelectedLocation(updatedLocation); 
  };
  
  const handleAddNewLocation = async (newLocationData: Omit<Location, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'locations'), newLocationData);
        const newLocationWithId = { id: docRef.id, ...newLocationData } as Location;
        setAllLocations(prev => [...prev, newLocationWithId]);
        setSelectedLocation(newLocationWithId);
    } catch (error) {
        console.error("Error adding new location: ", error);
        throw error;
    }
  };
  
  const handleSoftDeleteLocation = async (locationId: string, locationName: string) => {
    try {
        await updateDoc(doc(db, "locations", locationId), { isDeleted: true });
        setAllLocations(prev => prev.map(loc => loc.id === locationId ? { ...loc, isDeleted: true } : loc));
        setSelectedLocation(null); // Deselect after deleting
        toast({
            title: "Location Moved to Trash",
            description: `${locationName} has been moved to the trash.`,
        });
    } catch (error) {
        console.error("Error deleting location: ", error);
        toast({
            title: "Delete Failed",
            description: `Could not move ${locationName} to trash. Please try again.`,
            variant: "destructive",
        });
    }
  };

  const filteredLocations = (
    activeCategory === 'All'
      ? allLocations.filter(loc => !loc.isDeleted)
      : allLocations.filter((loc) => {
          if (loc.isDeleted) return false;
          const locCategories = Array.isArray(loc.category) ? loc.category : [loc.category];
          return locCategories.includes(activeCategory);
        })
  ).sort((a, b) => a.name.localeCompare(b.name, 'th', { numeric: true }));

  const handleSelectLocation = (location: Location | null) => {
    if (isRepositioning || isAddingLocation) return;
    setSelectedLocation(location);
    if(isSheetOpen) {
        setIsSheetOpen(false); 
    }
  }

  const handleMapClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isAddingLocation && !isRepositioning) return;

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
        // We only update the position in the local state.
        // The final save is done in the sheet.
        setFormData(updatedLocation);
        setAllLocations((prev) => prev.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
        setIsRepositioning(false);
        setIsSheetOpen(true);
        toast({
            title: "Position Updated",
            description: "Click 'Save Changes' in the edit panel to confirm the new location.",
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

  // A bit of a hack to pass form data state down to the map click handler
  const [formData, setFormData] = useState<Location | null>(selectedLocation);
   useEffect(() => {
    setFormData(selectedLocation);
  }, [selectedLocation]);


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
                {allCategories.map((category) => (
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
          {isLoading ? (
             <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                <p className="mt-2">Loading Locations...</p>
             </div>
          ) : (
            <LocationList
                locations={filteredLocations}
                onSelectLocation={handleSelectLocation}
                selectedLocation={selectedLocation}
            />
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            <Button variant="ghost" asChild>
              <Link href="/dev">
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
            onDelete={handleSoftDeleteLocation}
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
