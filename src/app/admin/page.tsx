'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { locations as initialLocations } from '@/lib/data';
import type { Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Map } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


interface AdminUser {
    name: string;
    surname: string;
    email: string;
}

function EditLocationForm({
  location,
  onSave,
}: {
  location: Location;
  onSave: (updatedLocation: Location) => void;
}) {
  const [formData, setFormData] = useState(location);
  const [isSaving, setIsSaving] = useState(false);

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
    }, 1000);
  };

  return (
    <DialogContent className="sm:max-w-[625px]">
      <DialogHeader>
        <DialogTitle>Edit: {location.name}</DialogTitle>
      </DialogHeader>
      <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="pt-2 text-right">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="col-span-3"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="announcement" className="pt-2 text-right">
            Announcement
          </Label>
          <Textarea
            id="announcement"
            value={formData.announcement || ''}
            onChange={handleChange}
            className="col-span-3"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Map Position</Label>
            <div className="col-span-3 grid grid-cols-2 gap-2">
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
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locations, setLocations] = useState(initialLocations);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user && sessionStorage.getItem('dpu-admin-auth') === 'true') {
            setIsAuthenticated(true);

            // Fetch admin details from Firestore
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDocSnap = await getDoc(adminDocRef);

            if (adminDocSnap.exists()) {
                const adminData = adminDocSnap.data() as Omit<AdminUser, 'email'>;
                setAdminUser({
                    name: adminData.name,
                    surname: adminData.surname,
                    email: user.email || 'No email found',
                });
            } else {
                 setAdminUser({
                    name: 'Admin',
                    surname: '',
                    email: user.email || 'No email found',
                });
            }
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
    toast({
      title: 'Location Updated',
      description: `${updatedLocation.name} has been saved successfully.`,
    });
    document.querySelector<HTMLElement>('[data-radix-dialog-content]')?.parentElement?.querySelector('button')?.click();
  };
  
  const handleLogout = async () => {
    try {
        await auth.signOut();
        sessionStorage.removeItem('dpu-admin-auth');
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        router.push('/admin/login');
    } catch (error) {
        console.error('Logout Error:', error);
        toast({
            title: 'Logout Failed',
            description: 'An error occurred while logging out.',
            variant: 'destructive',
        });
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
            <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
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
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/edit-map">
                      <Map className="h-5 w-5" />
                      <span className="sr-only">Switch to Edit Map</span>
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
                Click "Edit" to update location details. Changes are saved for the current session.
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
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <EditLocationForm
                            location={location}
                            onSave={handleSaveLocation}
                          />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </TooltipProvider>
  );
}

    