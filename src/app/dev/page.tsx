'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import type { Location, DirectoryPage, RoomItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Map, Trash2, UserPlus, PlusCircle, UploadCloud, Move, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, deleteDoc, updateDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { uploadImage } from '@/ai/flows/upload-image-flow';


interface AdminUser {
    name: string;
    surname: string;
    email: string;
}

// Extracted EditLocationSheet for use within the DevPage
function EditLocationSheet({
  location,
  onSave,
  onDelete,
  isOpen,
  onOpenChange,
}: {
  location: Location | null;
  onSave: (updatedLocation: Location) => void;
  onDelete: (locationId: string, locationName: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [formData, setFormData] = useState<Location | null>(location);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [activePageIndex, setActivePageIndex] = useState(0);

  useEffect(() => {
    const sanitizedLocation = location ? {
        ...location,
        directoryInfo: location.directoryInfo || []
    } : null;
    setFormData(sanitizedLocation);
    setUploadProgress(0);
    setIsUploading(false);
    setActivePageIndex(0); 
  }, [location]);

  if (!formData || !location) return null;

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => prev ? ({ ...prev, [id]: value }) : null);
  };
  
  const handleDirectoryPageChange = (index: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const newDirectoryInfo = [...(prev.directoryInfo || [])];
      newDirectoryInfo[index] = { ...newDirectoryInfo[index], [field]: value, items: newDirectoryInfo[index].items || [] };
      return { ...prev, directoryInfo: newDirectoryInfo };
    });
  }

  const handleRoomItemChange = (pageIndex: number, itemIndex: number, field: 'name' | 'details', value: string) => {
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
        const newPage: DirectoryPage = { title: `Page ${ (prev.directoryInfo?.length || 0) + 2 }`, items: [] };
        const newDirectoryInfo = [...(prev.directoryInfo || []), newPage];
        setActivePageIndex(newDirectoryInfo.length);
        return { ...prev, directoryInfo: newDirectoryInfo };
    });
  };

  const removeDirectoryPage = (index: number) => {
    setFormData(prev => {
        if (!prev) return null;
        const newDirectoryInfo = (prev.directoryInfo || []).filter((_, i) => i !== index);
        setActivePageIndex(Math.max(0, activePageIndex - 1));
        return { ...prev, directoryInfo: newDirectoryInfo };
    });
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

  const handleDelete = () => {
    if (!location) return;
    onDelete(location.id, location.name);
    onOpenChange(false);
  }
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[550px]">
        <SheetHeader>
          <SheetTitle>Edit: {location?.name}</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 border-b border-border pb-2 mb-4 overflow-x-auto">
            <Button
              variant={activePageIndex === 0 ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setActivePageIndex(0)}
              className="shrink-0"
            >
              Page 1
            </Button>
            {formData.directoryInfo?.map((page, index) => (
                <Button
                    key={index}
                    variant={activePageIndex === index + 1 ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActivePageIndex(index + 1)}
                    className="shrink-0"
                >
                    {page.title || `Page ${index + 2}`}
                </Button>
            ))}
            <Button onClick={addDirectoryPage} variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                <PlusCircle className="h-4 w-4"/>
            </Button>
        </div>

        <div className="grid max-h-[calc(100vh-220px)] gap-4 overflow-y-auto p-1">
          {activePageIndex === 0 ? (
            <>
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
                      <p className="text-xs text-muted-foreground">{uploadProgress === 100 ? 'Finalizing...' : `Uploading... ${uploadProgress}%`}</p>
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
                  <Input id="name" value={formData.name} onChange={handleFieldChange} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="description">Description (Page 1)</Label>
                  <Textarea id="description" value={formData.description} onChange={handleFieldChange} rows={4} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="announcement">Announcement</Label>
                  <Textarea id="announcement" value={formData.announcement || ''} onChange={handleFieldChange} rows={2} />
              </div>
              <p className="text-center text-sm text-muted-foreground pt-4">
                  Map position and opening hours can be edited on the 'Edit Map' page.
              </p>
            </>
          ) : (
            formData.directoryInfo && formData.directoryInfo[activePageIndex - 1] && (
              <div className="space-y-4 animate-in fade-in-0">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Editing Page: {formData.directoryInfo[activePageIndex - 1].title}</h3>
                     <Button
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
                
                <div className="space-y-4">
                  <Label>Items</Label>
                  {(formData.directoryInfo[activePageIndex - 1].items || []).map((item, itemIndex) => (
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
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6 text-destructive"
                            onClick={() => removeRoomItem(activePageIndex - 1, itemIndex)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={() => addRoomItem(activePageIndex - 1)} className="w-full">
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
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete Location
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  <span className="font-bold"> {location.name} </span>
                  location from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Yes, delete it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex gap-2">
            <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button onClick={handleSave} disabled={isSaving || isUploading}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


export default function DevPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // State for the edit sheet
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user && sessionStorage.getItem('dpu-admin-auth') === 'true') {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (adminDocSnap.exists()) {
                setIsAuthenticated(true);
                const adminData = adminDocSnap.data() as Omit<AdminUser, 'email'>;
                setAdminUser({
                    name: adminData.name,
                    surname: adminData.surname,
                    email: user.email || 'No email found',
                });
            } else {
                 setAdminUser({
                    name: 'Dev',
                    surname: '',
                    email: user.email || 'No email found',
                });
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
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching locations: ", error);
        toast({
            title: "Error fetching locations",
            description: "Could not fetch locations from the database.",
            variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchLocations();
    }
  }, [isAuthenticated, toast]);
  
  const handleEditClick = (location: Location) => {
    setEditingLocation(location);
    setIsSheetOpen(true);
  };
  
  const handleSaveLocation = (updatedLocation: Location) => {
    setLocations((prevLocations) =>
      prevLocations.map((loc) =>
        loc.id === updatedLocation.id ? updatedLocation : loc
      )
    );
  };

  const handleDeleteLocation = async (locationId: string, locationName: string) => {
    try {
        await deleteDoc(doc(db, "locations", locationId));
        setLocations(prevLocations => prevLocations.filter(loc => loc.id !== locationId));
        toast({
            title: "Location Deleted",
            description: `${locationName} has been successfully deleted.`,
        });
    } catch (error) {
        console.error("Error deleting location: ", error);
        toast({
            title: "Delete Failed",
            description: `Could not delete ${locationName}. Please try again.`,
            variant: "destructive",
        });
    }
  };
  
  const handleLogout = async () => {
    try {
        await auth.signOut();
        sessionStorage.removeItem('dpu-admin-auth');
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/');
    } catch (error) {
        console.error('Logout Error:', error);
        toast({
            title: 'Logout Failed',
            description: 'An error occurred while logging out.',
            variant: 'destructive',
        });
    }
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
    <TooltipProvider>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
                src="/Logo.jpg"
                alt="DPU Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            <h1 className="font-headline text-3xl font-bold">Dev Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
              {adminUser ? (
                  <div className="text-right">
                      <p className="font-semibold">{`${adminUser.name} ${adminUser.surname}`}</p>
                      <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                  </div>
              ) : (
                  <div className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                  </div>
              )}
              <Avatar>
                  <AvatarFallback>
                      <User />
                  </AvatarFallback>
              </Avatar>
               <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" asChild>
                        <Link href="/dev/register">
                            <UserPlus className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Add Dev</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add New Dev</p>
                </TooltipContent>
              </Tooltip>
               <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" asChild>
                        <Link href="/dev/add-admin">
                            <UserPlus className="h-4 w-4 md:mr-2" />
                             <span className="hidden md:inline">Add Admin</span>
                        </Link>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Add Announcement Admin</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" asChild>
                    <Link href="/dev/edit-map">
                      <Map className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Edit Map</span>
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Map</p>
                </TooltipContent>
              </Tooltip>
              <Button variant="destructive" onClick={handleLogout}>
                  Logout
              </Button>
          </div>
        </header>
        <main>
          <Card>
            <CardHeader>
              <CardTitle>Manage Locations</CardTitle>
              <CardDescription>
                View, edit, or delete campus locations. Changes are saved directly to the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.category}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(location)}>
                            Edit
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive-outline" size="sm">
                                <Trash2 className="mr-2 h-4 w-4"/>
                                Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the
                                <span className="font-bold"> {location.name} </span> 
                                location.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteLocation(location.id, location.name)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
        
        <EditLocationSheet
            location={editingLocation}
            onSave={handleSaveLocation}
            onDelete={handleDeleteLocation}
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
        />
      </div>
    </TooltipProvider>
  );
}
