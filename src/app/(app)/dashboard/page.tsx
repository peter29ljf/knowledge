'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CurrentDateDisplay from '@/components/dashboard/CurrentDateDisplay';
import UserScoreWidget from '@/components/dashboard/UserScoreWidget';
import AdminAnnouncementsDisplay from '@/components/dashboard/AdminAnnouncementsDisplay';
import ContactAdminSection from '@/components/dashboard/ContactAdminSection';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarDays, TrendingUp, MessageSquare, Send } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null; // Or a loading state

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Welcome, {user.name}!</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Ready to learn something new today?
              </CardDescription>
            </div>
            <div className="mt-4 sm:mt-0">
                <Image src="https://picsum.photos/seed/dashboardhero/300/150" alt="Abstract learning concept" width={300} height={150} className="rounded-lg shadow-md" data-ai-hint="abstract learning" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
           <CurrentDateDisplay />
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Your Score</CardTitle>
            <TrendingUp className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <UserScoreWidget />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Admin Announcements</CardTitle>
            <MessageSquare className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <AdminAnnouncementsDisplay />
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-medium">Contact Administrator</CardTitle>
          <Send className="h-6 w-6 text-primary" />
        </CardHeader>
        <CardContent>
          <ContactAdminSection />
        </CardContent>
      </Card>
    </div>
  );
}
