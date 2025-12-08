'use client';

import { FirebaseClientProvider } from '@/firebase';
import { SidebarProvider } from '@/components/ui/sidebar';

export function Providers({ children }: { children: React.ReactNode }) {
  // Note: We are not wrapping with SidebarProvider here anymore.
  // It will be handled in the specific layout that needs it.
  return <FirebaseClientProvider>{children}</FirebaseClientProvider>;
}
