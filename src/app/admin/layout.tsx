'use client';
import type { ReactNode} from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';

import {
  BookOpenCheck,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Megaphone,
  Users,
  LogOut,
  Menu,
  Settings,
  ChevronLeft,
  BookMarked,
  ShieldCheck
} from 'lucide-react';

const adminNavItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Materials', href: '/admin/materials', icon: FileText },
  { name: 'Quizzes', href: '/admin/quizzes', icon: ClipboardList },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Messages', href: '/admin/messages', icon: Users },
  // { name: 'Users', href: '/admin/users', icon: Users },
  // { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!user || user.role !== 'admin') {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router, mounted]);

  if (!mounted || isLoading || !user || user.role !== 'admin') {
    return <div className="flex h-screen items-center justify-center"><LayoutDashboard className="h-12 w-12 animate-pulse text-primary" /></div>;
  }

  const SidebarNavigation = () => (
    <>
      <SidebarHeader className="p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <ShieldCheck className="h-8 w-8 text-sidebar-primary group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
          <span className="text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">Admin Panel</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.name}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))}
                  tooltip={item.name}
                  className="text-base"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
         <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                    <SidebarMenuButton variant="outline" className="text-base">
                        <ChevronLeft className="h-5 w-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Back to App</span>
                    </SidebarMenuButton>
                </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} variant="outline" className="text-base text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </>
  );


  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
         <SidebarNavigation />
      </Sidebar>
      <div className="flex flex-col md:pl-[var(--sidebar-width-icon)] group-data-[state=expanded]:md:pl-[var(--sidebar-width)] transition-[padding-left] duration-200 ease-linear">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 shadow-sm">
          <div className="md:hidden"> {/* For mobile sidebar toggle */}
             <SidebarTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SidebarTrigger>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
                {adminNavItems.find(item => pathname.startsWith(item.href))?.name || 'Admin Dashboard'}
            </h1>
          </div>
           <Button onClick={() => router.push('/dashboard')} variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" /> User View
            </Button>
            <Button onClick={logout} variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
               <span className="sr-only">Log Out</span>
            </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/30 min-h-[calc(100vh-4rem)]">
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
