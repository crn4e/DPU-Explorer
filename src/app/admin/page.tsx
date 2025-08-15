'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DpuLogo } from '@/components/dpu-logo';
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
import { Loader2 } from 'lucide-react';

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
        {/* Simplified hours editing */}
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
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would be a proper auth flow.
    // For this demo, we check if we've already authenticated in this session.
    if (sessionStorage.getItem('dpu-admin-auth') === 'true') {
      setIsAuthenticated(true);
      return;
    }

    const password = prompt('Enter admin password:');
    if (password === 'dpuadmin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('dpu-admin-auth', 'true');
    } else {
      alert('Incorrect password.');
      router.push('/');
    }
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
    // Find the dialog close button and click it programmatically
    document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new MouseEvent('click'));
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DpuLogo className="h-10 w-10 text-primary" />
          <h1 className="font-headline text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Button variant="outline" onClick={() => router.push('/')}>
          Back to Site
        </Button>
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
  );
}

// Dummy Card components to satisfy compiler since they are not in the provided files.
const Card = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm" {...props}>
      {children}
    </div>
  );
  
  const CardHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="flex flex-col space-y-1.5 p-6" {...props}>
      {children}
    </div>
  );
  
  const CardTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold leading-none tracking-tight" {...props}>
      {children}
    </h3>
  );
  
  const CardDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-sm text-muted-foreground" {...props}>
      {children}
    </p>
  );
  
  const CardContent = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className="p-6 pt-0" {...props}>
      {children}
    </div>
  );
