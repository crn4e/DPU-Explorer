'use client';
import Image from 'next/image';
import type { Location } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Megaphone, CalendarDays, BookUser } from 'lucide-react';
import { checkOpenStatus } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

interface LocationCardProps {
  location: Location;
}

const defaultImageInfo = placeholderImages['default' as keyof typeof placeholderImages].main;

const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function LocationCard({ location }: LocationCardProps) {
  const [status, setStatus] = useState<{ isOpen: boolean | null; closesAt: string; opensAt: string, todayName: string }>({ isOpen: null, closesAt: '', opensAt: '', todayName: '' });
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const newStatus = checkOpenStatus(location);
    setStatus(newStatus);
    
    const intervalId = setInterval(() => {
      setStatus(checkOpenStatus(location));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [location]);
  
  useEffect(() => {
    if (api) {
      const handleSelect = () => {
        setCurrentSlide(api.selectedScrollSnap());
      };
      api.on('select', handleSelect);
      return () => {
        api.off('select', handleSelect);
      };
    }
  }, [api]);

  const hasDirectoryInfo = location.directoryInfo && location.directoryInfo.length > 0;
  const categories = Array.isArray(location.category) ? location.category : [location.category];

  const imageInfo = placeholderImages[location.id as keyof typeof placeholderImages]?.main || defaultImageInfo;
  const mainImageUrl = imageInfo.url;
  const mainImageHint = imageInfo.hint;


  return (
    <Card className="overflow-hidden shadow-2xl transition-all duration-300 animate-in fade-in-0 zoom-in-95">
      <CardHeader className="relative p-0">
        <div className="relative aspect-video w-full">
          <Image
            key={location.id}
            src={mainImageUrl}
            alt={`Image of ${location.name}`}
            fill
            className="object-cover"
            data-ai-hint={mainImageHint}
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <CardTitle className="font-headline text-2xl text-white">
            {location.name}
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-1">
            {categories.map(cat => (
              <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
            ))}
          </div>
        </div>
      </CardHeader>

      <Carousel 
        className="w-full" 
        opts={{ loop: hasDirectoryInfo }}
        setApi={setApi}
      >
        <CarouselContent>
          <CarouselItem>
            <CardContent className="p-6 select-none">
              {status.isOpen !== null ? (
                <div className="mb-4 flex items-center gap-3">
                  <Badge
                    className={cn(
                      "text-sm",
                      status.isOpen ? "bg-green-600 text-white hover:bg-green-700" : "bg-destructive text-destructive-foreground"
                    )}
                  >
                    {status.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {status.isOpen ? `Closes at ${status.closesAt}` : (status.opensAt ? `Opens at ${status.opensAt}` : 'Closed today')}
                    </span>
                  </div>
                </div>
              ) : <div className="h-6 mb-4" /> }

              <p className="mb-6 text-foreground/90 whitespace-pre-wrap">{location.description}</p>
              
              {location.announcement && (
                  <div className="mb-6 rounded-lg border border-accent/50 bg-accent/10 p-4">
                      <div className="flex items-center gap-3">
                          <Megaphone className="h-6 w-6 text-accent" />
                          <div>
                              <h3 className="font-bold text-accent-foreground">Announcement</h3>
                              <p className="text-sm text-accent-foreground/80">{location.announcement}</p>
                          </div>
                      </div>
                  </div>
              )}

              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <h3 className="font-bold font-headline text-lg text-primary">Opening Hours</h3>
                  </div>
                   {location.hours ? (
                    <ul className="space-y-1 text-sm">
                      {daysOfWeek.map((day) => (
                        <li
                          key={day}
                          className={cn(
                            'flex justify-between',
                            day === status.todayName
                              ? 'font-bold text-primary'
                              : 'text-muted-foreground'
                          )}
                        >
                          <span>{day}</span>
                          <span>
                            {location.hours && location.hours[day] && typeof location.hours[day] === 'object'
                              ? `${(location.hours[day] as { open: string; close: string }).open} - ${
                                  (location.hours[day] as { open: string; close: string }).close
                                }`
                              : 'Closed'}
                          </span>
                        </li>
                      ))}
                    </ul>
                   ) : (
                    <p className="text-sm text-muted-foreground">No opening hours available.</p>
                   )}
              </div>

            </CardContent>
          </CarouselItem>
          {location.directoryInfo?.map((page, index) => {
            const pageImageInfo = page.imageId && placeholderImages[location.id as keyof typeof placeholderImages]?.directoryPages?.[page.imageId as keyof typeof placeholderImages[keyof typeof placeholderImages]['directoryPages']] 
              ? placeholderImages[location.id as keyof typeof placeholderImages]?.directoryPages?.[page.imageId as keyof typeof placeholderImages[keyof typeof placeholderImages]['directoryPages']]
              : null;
            
            return (
              <CarouselItem key={page.imageId || index}>
                  <CardContent className="p-6 select-none">
                      {pageImageInfo && (
                        <div className="relative aspect-video w-full mb-4 rounded-md overflow-hidden">
                          <Image
                            src={pageImageInfo.url}
                            alt={page.title}
                            fill
                            className="object-cover"
                            data-ai-hint={pageImageInfo.hint}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-4">
                          <BookUser className="h-5 w-5 text-primary" />
                          <h3 className="font-bold font-headline text-lg text-primary">{page.title}</h3>
                      </div>
                      {page.description && (
                          <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{page.description}</p>
                      )}
                      <div className="prose prose-sm dark:prose-invert max-h-60 space-y-2 overflow-y-auto">
                          {(page.items || []).map((item, itemIndex) => (
                            <div key={itemIndex}>
                              <p className="font-semibold mb-0">{item.name}</p>
                              <p className="text-muted-foreground mt-0 whitespace-pre-wrap">{item.details}</p>
                            </div>
                          ))}
                      </div>
                  </CardContent>
              </CarouselItem>
            )
          })}
        </CarouselContent>
        {hasDirectoryInfo && (
            <CardFooter className="flex justify-center items-center py-2 gap-2">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
            </CardFooter>
        )}
      </Carousel>
    </Card>
  );
}
