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
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/firebase/error-emitter';

export default function DevLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const devDocRef = doc(db, 'admins', user.uid);

      try {
        const devDocSnap = await getDoc(devDocRef);
        if (devDocSnap.exists()) {
          sessionStorage.setItem('dpu-admin-auth', 'true');
          toast({
            title: 'Login Successful',
            description: 'Welcome back, Dev!',
          });
          router.push('/dev');
        } else {
          // If the user exists in Auth but not in the 'admins' collection
          toast({
            title: 'Access Denied',
            description: 'This account does not have developer privileges.',
            variant: 'destructive',
          });
          await auth.signOut();
        }
      } catch (e) {
          const permissionError = new FirestorePermissionError({ path: devDocRef.path, operation: 'get' });
          errorEmitter.emit('permission-error', permissionError);
          // Also provide immediate user feedback
           toast({
            title: 'Login Error',
            description: 'Could not verify developer status due to a permissions issue.',
            variant: 'destructive',
          });
          await auth.signOut();
      }
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
    <div className="relative flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
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
                <CardTitle className="font-headline text-2xl">Dev Login</CardTitle>
            </div>
          <CardDescription>Enter your developer credentials to access the dev panel.</CardDescription>
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
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pr-10"
              />
              <Button 
                type="button"
                variant="ghost" 
                size="icon"
                className="absolute right-1 top-6 h-7 w-7 text-muted-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span>Login as Dev</span>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
