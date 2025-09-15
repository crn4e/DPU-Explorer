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
import { createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


export default function AdminRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // You can save additional user info to Firestore
        await setDoc(doc(db, "admins", user.uid), {
            id: id,
            name: name,
            surname: surname,
            email: email,
            role: 'admin'
        });

        toast({
            title: 'Registration Successful',
            description: 'Your admin account has been created.',
        });
        router.push('/admin/login');

    } catch (error) {
        const authError = error as AuthError;
        console.error('Firebase Registration Error:', authError);
        toast({
            title: 'Registration Failed',
            description: authError.message || 'An unexpected error occurred.',
            variant: 'destructive',
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <Button asChild variant="ghost" className="absolute left-4 top-4">
            <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
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
                        <CardTitle className="font-headline text-2xl">Admin Registration</CardTitle>
                    </div>
                <CardDescription>Create a new administrator account.</CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="id">ID</Label>
                    <Input id="id" placeholder="Your unique ID" required disabled={isLoading} value={id} onChange={(e) => setId(e.target.value)} />
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
                    <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register
                    </Button>
                    <Button variant="link" size="sm" asChild disabled={isLoading}>
                        <Link href="/admin/login">
                            Already have an account? Login
                        </Link>
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}
