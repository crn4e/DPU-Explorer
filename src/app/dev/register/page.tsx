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
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


export default function DevRegisterPage() {
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
    
    if (password.length < 6) {
        toast({
            title: 'Registration Failed',
            description: 'Password should be at least 6 characters.',
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

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "admins", user.uid), {
            id: id,
            name: name,
            surname: surname,
            email: email
        });
        
        await signOut(auth);

        // Re-sign in the original admin
        // This is a simplified approach. In a real app, you might need a more secure way to handle this.
        if (currentAdmin.email) {
            // This is a placeholder for re-authentication logic.
            // You might need to prompt the admin for their password again, or use a session token.
            // For now, we assume the session is still valid for a redirect.
        }
        
        toast({
            title: 'Dev Created',
            description: 'The new dev account has been created successfully.',
        });
        router.push('/dev');

    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred.';
        if (error.code) {
          switch (error.code) {
            case 'auth/email-already-in-use':
              errorMessage = 'This email is already in use by another account.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'The email address is not valid.';
              break;
            case 'auth/weak-password':
              errorMessage = 'Password should be at least 6 characters.';
              break;
            default:
              errorMessage = 'An error occurred during registration.';
          }
        }
        console.error('Firebase Registration Error:', error);
        toast({
            title: 'Registration Failed',
            description: errorMessage,
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
                <CardDescription>Create a new developer account.</CardDescription>
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
                    <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Dev Account
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}
