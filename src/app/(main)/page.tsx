'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import LocationList from '@/components/location-list';
import MapView from '@/components/map-view';
import AiTourGuide from '@/components/ai-tour-guide';
import type { Location, LocationCategory } from '@/lib/types';
import { Loader2, User } from 'lucide-react';
import AppHeader from '@/components/header';
import AiChat from '@/components/ai-chat';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const allCategories: (LocationCategory | 'All')[] = [
  'All',
  'Academic',
  'Food',
  'Recreation',
  'Services',
];

export default function Home() {
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'All'>('All');
  const mapImageWrapperRef = React.useRef<HTMLDivElement>(null);
  
  const { userProfile, isProfileLoading } = useUserProfile();
  const { toast } = useToast();
  const router = useRouter();


  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        const locationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
        setAllLocations(locationsData);
      } catch (error) {
        console.error("Error fetching locations: ", error);
        // Optionally, handle the error in the UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLogout = async () => {
    try {
        await auth.signOut();
        sessionStorage.clear(); // Clear all session storage on logout
        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });
        // This will trigger the useEffect in useUserProfile to clear the profile
        router.refresh();
    } catch (error) {
        console.error('Logout Error:', error);
        toast({
            title: 'Logout Failed',
            description: 'An error occurred while logging out.',
            variant: 'destructive',
        });
    }
  }

  const filteredLocations = (
    activeCategory === 'All'
      ? allLocations
      : allLocations.filter((loc) => {
          const locCategories = Array.isArray(loc.category) ? loc.category : [loc.category];
          return locCategories.includes(activeCategory);
        })
  ).sort((a, b) => a.name.localeCompare(b.name, 'th', { numeric: true }));

  return (
    <div className="flex h-screen w-full">
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
                  DPU Explorer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your Campus Companion
                </p>
              </div>
            </div>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarFallback>
                                {isProfileLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <User />
                                )}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {userProfile ? (
                        <>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {userProfile.name} {userProfile.surname}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {userProfile.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                Logout
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                           <DropdownMenuLabel>Student Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href="/login">Login</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href="/register">Register</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Admin</DropdownMenuLabel>
                             <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                              <Link href="/login">Admin Login</Link>
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
             </DropdownMenu>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2">
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
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <LocationList
                locations={filteredLocations}
                onSelectLocation={setSelectedLocation}
                selectedLocation={selectedLocation}
            />
          )}
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            <AiTourGuide />
            <AiChat />
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <MapView
          mapImageWrapperRef={mapImageWrapperRef}
          selectedLocation={selectedLocation}
          locations={filteredLocations}
          onSelectLocation={setSelectedLocation}
        />
      </SidebarInset>
    </div>
  );
}
