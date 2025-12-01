'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Map, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
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


export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user && sessionStorage.getItem('dpu-admin-auth') === 'true') {
            setIsAuthenticated(true);

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
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/edit-map">
                                Edit
                            </Link>
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
      </div>
    </TooltipProvider>
  );
}
