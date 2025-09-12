'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AdminRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
        <div className="flex justify-center items-center gap-3 mb-2">
            <Image
                src="/Logo.jpg"
                alt="DPU Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
            />
            <CardTitle className="font-headline text-2xl">Register</CardTitle>
        </div>
          <CardDescription>Registration is currently disabled.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            For access, please contact the system administrator.
          </p>
          <Button variant="outline" asChild className="mt-6 w-full">
            <Link href="/admin/login">Back to Login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
