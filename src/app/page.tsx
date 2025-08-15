'use client';

import { useState } from 'react';
import Link from 'next/link';
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
import { DpuLogo } from '@/components/dpu-logo';
import LocationList from '@/components/location-list';
import MapView from '@/components/map-view';
import AiTourGuide from '@/components/ai-tour-guide';
import { locations as allLocations } from '@/lib/data';
import type { Location, LocationCategory } from '@/lib/types';
import { KeyRound } from 'lucide-react';
import AppHeader from '@/components/header';

const categories: (LocationCategory | 'All')[] = [
  'All',
  'Academic',
  'Food',
  'Recreation',
  'Services',
];

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    allLocations[0]
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
          <div className="flex items-center gap-3 p-2">
            <DpuLogo className="h-10 w-10 text-primary" />
            <div className="flex flex-col">
              <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">
                DPU Explorer
              </h1>
              <p className="text-sm text-muted-foreground">
                Your Campus Companion
              </p>
            </div>
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
            <Button variant="ghost" asChild>
              <Link href="/admin">
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
