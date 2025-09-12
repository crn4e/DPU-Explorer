'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import LocationList from '@/components/location-list';
import MapView from '@/components/map-view';
import AiTourGuide from '@/components/ai-tour-guide';
import { locations as allLocations } from '@/lib/data';
import type { Location, LocationCategory } from '@/lib/types';
import { KeyRound, User } from 'lucide-react';
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

const categories: (LocationCategory | 'All')[] = [
  'All',
  'Academic',
  'Food',
  'Recreation',
  'Services',
];

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [activeCategory, setActiveCategory] = useState<LocationCategory | 'All'>('All');

  const filteredLocations =
    activeCategory === 'All'
      ? allLocations
      : allLocations.filter((loc) => loc.category === activeCategory);

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
                                <User />
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Student Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/student/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/student/register">Register</Link>
                    </DropdownMenuItem>
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
          <LocationList
            locations={filteredLocations}
            onSelectLocation={setSelectedLocation}
            selectedLocation={selectedLocation}
          />
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-2">
            <AiTourGuide />
            <AiChat />
            <Button variant="ghost" asChild>
              <Link href="/admin/login">
                <KeyRound className="mr-2 h-4 w-4" />
                Admin Login
              </Link>
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <MapView
          selectedLocation={selectedLocation}
          locations={filteredLocations}
          onSelectLocation={setSelectedLocation}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
