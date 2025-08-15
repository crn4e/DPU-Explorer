import { SidebarTrigger } from '@/components/ui/sidebar';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:hidden">
      <SidebarTrigger />
      <h1 className="font-headline text-lg font-bold text-primary">DPU Explorer</h1>
    </header>
  );
}
