'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Find the user's email from their admin ID
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('id', '==', id));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('Admin ID not found.');
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data();
      const email = adminData.email;

      if (!email) {
          throw new Error('No email associated with this Admin ID.');
      }

      // 2. Sign in with the retrieved email and provided password
      await signInWithEmailAndPassword(auth, email, password);

      sessionStorage.setItem('dpu-admin-auth', 'true');
      toast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
      });
      router.push('/admin');
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (error.code) {
          switch (error.code) {
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  errorMessage = 'Incorrect password. Please try again.';
                  break;
              case 'auth/user-not-found':
                  // This case might be less likely now, but good to have
                  errorMessage = 'No account found with this ID.';
                  break;
              default:
                  errorMessage = error.message;
          }
      } else if (error instanceof Error) {
          errorMessage = error.message;
      }
      
      console.error('Login Error:', error);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
       <Button asChild variant="ghost" className="absolute left-4 top-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
      
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
                <Image
                    src="/Logo.jpg"
                    alt="DPU Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                />
                <CardTitle className="font-headline text-2xl">Admin Login</CardTitle>
            </div>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">Admin ID</Label>
              <Input
                id="id"
                type="number"
                placeholder="Your Admin ID"
                required
                value={id}
                onChange={(e) => setId(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
            <Button variant="link" size="sm" asChild>
                <Link href="/admin/register">
                    Don't have an account? Register
                </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
