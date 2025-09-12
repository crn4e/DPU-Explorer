
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

export default function StudentLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call for student login
    setTimeout(() => {
      // Replace with your actual student authentication logic
      if (id === 'student' && password === 'dpu123') {
        sessionStorage.setItem('dpu-student-auth', 'true');
        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });
        router.push('/'); // Redirect to home page after login
      } else {
        toast({
          title: 'Login Failed',
          description: 'Incorrect Student ID or password.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900">
       <Button asChild variant="ghost" className="absolute left-4 top-4">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>
      <div className="flex min-h-screen items-center justify-center">
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
                  <CardTitle className="font-headline text-2xl">Student Login</CardTitle>
              </div>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">Student ID</Label>
                <Input
                  id="id"
                  type="text"
                  placeholder="ex.67xxxxxx"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
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
                  <Link href="/student/register">
                      Don't have an account? Register
                  </Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
