'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';


export default function DevRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!email || !id || !name || !surname) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill out all fields.',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
        const currentAdmin = auth.currentUser;
        if (!currentAdmin) {
            throw new Error("No dev is currently signed in.");
        }

        // We are NOT creating an auth user here.
        // We are just creating the user's record in Firestore.
        // Using email as the document ID for easy lookup.
        await setDoc(doc(db, "admins", email), {
            id: id,
            name: name,
            surname: surname,
            email: email
        });
        
        toast({
            title: 'Dev Record Created',
            description: 'The new dev record has been created successfully in Firestore.',
        });
        router.push('/dev');

    } catch (error: any) {
        console.error('Firestore Error:', error);
        toast({
            title: 'Creation Failed',
            description: error.message || 'Could not create the dev record.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <Button asChild variant="ghost" className="absolute left-4 top-4">
            <Link href="/dev">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
            </Link>
        </Button>
        <div className="flex min-h-full items-center justify-center">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center items-center gap-3 mb-2">
                        <Image
                            src="/Logo.jpg"
                            alt="DPU Logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        <CardTitle className="font-headline text-2xl">Create New Dev</CardTitle>
                    </div>
                <CardDescription>Create a new developer record.</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="id">ID</Label>
                    <Input 
                        id="id" 
                        type="text"
                        placeholder="Dev's unique ID" 
                        required 
                        disabled={isLoading} 
                        value={id} 
                        onChange={(e) => setId(e.target.value.replace(/[^0-9]/g, ''))} 
                    />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="John" required disabled={isLoading} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input id="surname" placeholder="Doe" required disabled={isLoading} value={surname} onChange={(e) => setSurname(e.target.value)} />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="[email protected]" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Dev Record
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}
