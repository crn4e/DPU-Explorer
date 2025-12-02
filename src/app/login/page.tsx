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
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check for Dev role
      const devDocRef = doc(db, 'admins', user.uid);
      const devDocSnap = await getDoc(devDocRef);
      if (devDocSnap.exists()) {
        sessionStorage.setItem('dpu-admin-auth', 'true'); // Keep session for dev
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Dev!',
        });
        router.push('/dev');
        return;
      }

      // Check for Announcement Admin role
      const adminDocRef = doc(db, 'announcementAdmins', user.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists()) {
        sessionStorage.setItem('dpu-announcement-admin-auth', 'true');
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Admin!',
        });
        router.push('/admin');
        return;
      }
      
      // Default to Student role
      sessionStorage.setItem('dpu-student-auth', 'true');
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      router.push('/'); 

    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (error.code) {
          switch (error.code) {
              case 'auth/wrong-password':
              case 'auth/invalid-credential':
                  errorMessage = 'Incorrect email or password. Please try again.';
                  break;
              case 'auth/user-not-found':
                  errorMessage = 'No account found with this email.';
                  break;
              default:
                  errorMessage = 'An error occurred during login. Please try again.';
          }
      }
      
      console.error('Login Error:', error);
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
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
                <CardTitle className="font-headline text-2xl">Login</CardTitle>
            </div>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="[email protected]"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                <Link href="/register">
                    Don't have an account? Register
                </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
