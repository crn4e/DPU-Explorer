'use client';

import { useState, useEffect, useTransition } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateCampusTour } from '@/ai/flows/generate-campus-tour';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

function SubmitButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <Button type="submit" disabled={isPending} className="w-full">
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      Generate Tour
    </Button>
  );
}

export default function AiTourGuide() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState('');
  const [interests, setInterests] = useState('');
  const [tourItinerary, setTourItinerary] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Set current time on client-side to avoid hydration mismatch
    setCurrentTime(format(new Date(), 'HH:mm'));
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!interests.trim()) {
      toast({
        title: 'Interests required',
        description: 'Please tell us what you are interested in.',
        variant: 'destructive',
      });
      return;
    }
    
    // Ensure currentTime is set before submitting
    const timeToSend = currentTime || format(new Date(), 'HH:mm');

    startTransition(async () => {
      try {
        const result = await generateCampusTour({ interests, currentTime: timeToSend });
        setTourItinerary(result.tourItinerary);
      } catch (error) {
        console.error('Failed to generate tour:', error);
        toast({
          title: 'Error',
          description:
            'Could not generate a tour at this time. Please try again later.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          <Sparkles className="mr-2 h-4 w-4" />
          AI-Powered Tour Guide
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-headline text-2xl">
            Personalized Campus Tour
          </SheetTitle>
          <SheetDescription>
            Tell us your interests, and our AI will create a custom tour plan
            for you, considering what's open right now.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="interests">Your Interests</Label>
              <Textarea
                id="interests"
                placeholder="e.g., 'I love graphic design, coding, and finding great coffee spots.'"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" disabled={isPending || !currentTime} className="w-full">
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Tour
            </Button>
          </form>
        </div>
        {(isPending || tourItinerary) && (
          <div className="mt-6 rounded-lg border bg-background p-4">
            <h3 className="font-headline text-lg font-semibold">
              Your Custom Itinerary
            </h3>
            {isPending ? (
              <div className="space-y-2 pt-2">
                 <p className="text-sm text-muted-foreground flex items-center"><Sparkles className="h-4 w-4 mr-2 animate-pulse text-accent"/>Generating your personalized tour...</p>
              </div>
            ) : (
                <ScrollArea className="h-96 mt-2">
                    <div
                        className="prose prose-sm dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: tourItinerary.replace(/\n/g, '<br />') }}
                    />
                </ScrollArea>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
