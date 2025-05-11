'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { BookOpenCheck, LayoutDashboard, ListChecks, MessageSquare, LogOut, UserCircle, Loader2, CreditCard, Settings, HelpCircle, ShieldCheck } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Learning Materials', href: '/learning', icon: BookOpenCheck },
  { name: 'Quiz', href: '/quiz', icon: ListChecks },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { userScore, isLoading: appDataLoading } = useAppData();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (mounted && !authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router, mounted]);

  if (!mounted || authLoading || (!user && pathname !=='/login')) { // also check if user exists when not on login page
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return null; // Should be redirected by useEffect

  const getActiveTab = () => {
    const currentPath = navItems.find(item => pathname.startsWith(item.href));
    return currentPath ? currentPath.href : '/dashboard';
  };


  return (
    <div className="flex min-h-screen flex-col bg-secondary/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2 text-primary">
            <BookOpenCheck className="h-7 w-7" />
            <span className="text-2xl font-bold">StudyQuest</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium">
              Score: <span className="text-primary font-semibold">{appDataLoading ? <Loader2 className="inline h-4 w-4 animate-spin" /> : userScore.score}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} alt={user.name} data-ai-hint="user avatar" />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'admin' && (
                   <DropdownMenuItem onClick={() => router.push('/admin')}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                 <DropdownMenuItem disabled>
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing (Soon)</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings (Soon)</span>
                </DropdownMenuItem>
                 <DropdownMenuItem disabled>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support (Soon)</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
         <nav className="bg-background py-2 border-t">
          <Tabs value={getActiveTab()} className="w-full">
            <TabsList className="container grid w-full grid-cols-3 h-12">
              {navItems.map((item) => (
                <TabsTrigger key={item.href} value={item.href} asChild className="h-10 text-base">
                  <Link href={item.href} className="flex items-center space-x-2">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </nav>
      </header>
      
      <main className="flex-1 container py-8">
        {children}
      </main>

      <footer className="py-6 md:px-8 md:py-0 border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} StudyQuest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
