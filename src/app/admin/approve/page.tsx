
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface PendingAdmin extends DocumentData {
  uid: string;
  id: string;
  name: string;
  surname: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function ApproveAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user && sessionStorage.getItem('dpu-admin-auth') === 'true') {
        setIsAuthenticated(true);
        fetchPendingAdmins();
      } else {
        sessionStorage.removeItem('dpu-admin-auth');
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchPendingAdmins = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'admins'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const admins = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as PendingAdmin));
      setPendingAdmins(admins);
    } catch (error) {
      console.error("Error fetching pending admins: ", error);
      toast({
        title: "Error",
        description: "Could not fetch pending admins. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (uid: string, newStatus: 'approved' | 'rejected') => {
    try {
      const adminRef = doc(db, 'admins', uid);
      await updateDoc(adminRef, { status: newStatus });
      
      setPendingAdmins(prevAdmins => prevAdmins.filter(admin => admin.uid !== uid));
      
      toast({
        title: "Success",
        description: `Admin has been ${newStatus}.`,
      });
    } catch (error) {
      console.error(`Error updating admin status: `, error);
      toast({
        title: "Error",
        description: `Could not update admin status. Please try again.`,
        variant: "destructive",
      });
    }
  };


  if (!isAuthenticated && isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
            <Button asChild variant="ghost">
                <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
                </Link>
            </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Approve Admin Registrations</CardTitle>
            <CardDescription>
              Review and approve or reject new requests for administrator access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAdmins.length > 0 ? (
                    pendingAdmins.map((admin) => (
                      <TableRow key={admin.uid}>
                        <TableCell>{admin.id}</TableCell>
                        <TableCell className="font-medium">{`${admin.name} ${admin.surname}`}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{admin.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button size="icon" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateStatus(admin.uid, 'approved')}>
                            <Check className="h-4 w-4" />
                            <span className="sr-only">Approve</span>
                          </Button>
                          <Button size="icon" variant="destructive" onClick={() => handleUpdateStatus(admin.uid, 'rejected')}>
                            <X className="h-4 w-4" />
                             <span className="sr-only">Reject</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        No pending admin registrations.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
