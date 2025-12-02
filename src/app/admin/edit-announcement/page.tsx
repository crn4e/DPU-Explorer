'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Location } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';


export default function EditAnnouncementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [location, setLocation] = useState<Location | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const locationId = searchParams.get('locationId');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
        if (user && sessionStorage.getItem('dpu-announcement-admin-auth') === 'true') {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('dpu-announcement-admin-auth');
            router.push('/admin/login');
        }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated || !locationId) return;

    const fetchLocation = async () => {
      setIsLoading(true);
      try {
        const locationRef = doc(db, 'locations', locationId);
        const docSnap = await getDoc(locationRef);
        if (docSnap.exists()) {
          const locData = { id: docSnap.id, ...docSnap.data() } as Location;
          setLocation(locData);
          setAnnouncement(locData.announcement || '');
        } else {
          toast({
            title: 'Error',
            description: 'Location not found.',
            variant: 'destructive',
          });
          router.push('/admin');
        }
      } catch (error) {
        console.error("Error fetching location: ", error);
        toast({
          title: "Error",
          description: "Could not fetch location data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocation();
  }, [isAuthenticated, locationId, router, toast]);

  const handleSave = async () => {
    if (!locationId) return;
    setIsSaving(true);
    try {
      const locationRef = doc(db, 'locations', locationId);
      await updateDoc(locationRef, {
        announcement: announcement,
      });
      toast({
        title: 'Success!',
        description: `Announcement for ${location?.name} has been updated.`,
      });
      router.push('/admin');
    } catch (error) {
      console.error("Error saving announcement: ", error);
      toast({
        title: "Save Failed",
        description: "Could not save the announcement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading location data...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <Button asChild variant="ghost" className="absolute left-4 top-4">
            <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
            </Link>
        </Button>
        <div className="flex min-h-full items-center justify-center">
            <Card className="w-full max-w-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <Image
                            src="/Logo.jpg"
                            alt="DPU Logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <CardTitle className="font-headline text-2xl">Edit Announcement</CardTitle>
                    </div>
                <CardDescription>Editing announcement for: <span className="font-bold text-primary">{location?.name}</span></CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="announcement">Announcement Text</Label>
                        <Textarea
                            id="announcement"
                            value={announcement}
                            onChange={(e) => setAnnouncement(e.target.value)}
                            placeholder="Enter the announcement here. Leave blank to remove it."
                            rows={5}
                            disabled={isSaving}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} className="w-full" disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Announcement
                    </Button>
                </CardFooter>
            </Card>
        </div>
    </div>
  );
}
