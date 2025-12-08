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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Clock, Megaphone, CalendarDays, BookUser } from 'lucide-react';
import { checkOpenStatus } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import placeholderImages from '@/lib/placeholder-images.json';

interface LocationCardProps {
  location: Location;
}

type ImagesData = {
    [key: string]: {
      main: {
        url: string;
        hint: string;
      },
      directoryPages?: {
        [key: string]: {
          url: string;
          hint: string;
        }
      }
    }
}

const images: ImagesData = placeholderImages;
const defaultImage = { url: '/default.png', hint: 'placeholder' };

export default function LocationCard({ location }: LocationCardProps) {
  const [status, setStatus] = useState({ isOpen: false, closesAt: '', opensAt: '', todayName: '' });
  const [api, setApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const locationImages = images[location.id] || { main: defaultImage };
  const [currentImage, setCurrentImage] = useState(locationImages.main);

  useEffect(() => {
    if (api) {
      api.scrollTo(0);
      const handleSelect = () => {
        setCurrentSlide(api.selectedScrollSnap());
      };
      api.on('select', handleSelect);
      return () => {
        api.off('select', handleSelect);
      };
    }
  }, [api, location]);

  useEffect(() => {
    const newStatus = checkOpenStatus(location);
    setStatus(newStatus);
    
    const intervalId = setInterval(() => {
      setStatus(checkOpenStatus(location));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [location]);
  
  useEffect(() => {
    // Re-initialize image state when location changes
    const newLocationImages = images[location.id] || { main: defaultImage };
    setCurrentImage(newLocationImages.main);
    setCurrentSlide(0);
    api?.scrollTo(0);
  }, [location, api]);

  useEffect(() => {
    const locationImages = images[location.id] || { main: defaultImage };
    if (currentSlide === 0) {
      setCurrentImage(locationImages.main);
    } else {
      const pageIndex = currentSlide - 1;
      const directoryPage = location.directoryInfo?.[pageIndex];
      const pageImageId = directoryPage?.imageId;
      const pageImage = pageImageId ? locationImages.directoryPages?.[pageImageId] : null;
      setCurrentImage(pageImage || locationImages.main || defaultImage);
    }
  }, [currentSlide, location, images]);


  const hasDirectoryInfo = location.directoryInfo && location.directoryInfo.length > 0;

  return (
    <Card className="overflow-hidden shadow-2xl transition-all duration-300 animate-in fade-in-0 zoom-in-95">
      <Carousel 
        className="w-full" 
        opts={{ loop: hasDirectoryInfo }}
        setApi={setApi}
      >
        <CardHeader className="relative p-0">
           <div className="relative aspect-video w-full">
            <Image
              key={currentImage.url}
              src={currentImage.url}
              alt={`Image of ${location.name}`}
              width={600}
              height={400}
              className="aspect-video w-full object-cover transition-opacity duration-500 animate-in fade-in-0"
              data-ai-hint={currentImage.hint}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 p-6">
            <CardTitle className="font-headline text-2xl text-white">
              {location.name}
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {location.category}
            </CardDescription>
          </div>
        </CardHeader>

        <CarouselContent>
          <CarouselItem>
            <CardContent className="p-6 select-none">
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
                  <ul className="space-y-1 text-sm">
                      {Object.entries(location.hours).map(([day, hours]) => (
                          <li key={day} className={`flex justify-between ${day === status.todayName ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                              <span>{day}</span>
                              <span>{hours ? `${hours.open} - ${hours.close}` : 'Closed'}</span>
                          </li>
                      ))}
                  </ul>
              </div>

            </CardContent>
          </CarouselItem>
          {location.directoryInfo?.map((page, index) => (
            <CarouselItem key={index}>
                <CardContent className="p-6 select-none">
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
          ))}
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
