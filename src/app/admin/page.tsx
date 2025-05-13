'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ClipboardList, Megaphone, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAppData } from '@/contexts/AppDataContext';
import { useEffect } from 'react';
import Image from 'next/image';

const StatCard = ({ title, value, icon: Icon, description, link, linkText }: { title: string, value: string | number, icon: React.ElementType, description: string, link?: string, linkText?: string }) => (
  <Card className="shadow-md hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      <Icon className="h-5 w-5 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold text-primary">{value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {link && linkText && (
        <Button asChild variant="link" className="px-0 pt-2 text-primary">
          <Link href={link}>{linkText} <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      )}
    </CardContent>
  </Card>
);

export default function AdminDashboardPage() {
  const { learningMaterials, quizzes, announcements, adminMessages, fetchAllAdminContent, isLoading } = useAppData();
  
  useEffect(() => {
    fetchAllAdminContent();
  }, [fetchAllAdminContent]);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg overflow-hidden">
        <div className="grid md:grid-cols-3 items-center">
            <div className="md:col-span-2 p-6 md:p-8">
                 <CardHeader className="p-0 mb-4">
                    <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-10 w-10 text-primary"/>
                        <div>
                            <CardTitle className="text-3xl font-bold">Administrator Dashboard</CardTitle>
                            <CardDescription className="text-lg">Manage StudyQuest content and users.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <p className="text-muted-foreground mb-6">
                    Welcome to the admin panel. From here, you can manage learning materials, quizzes, announcements, and view user interactions.
                </p>
                <div className="flex space-x-3">
                    <Button asChild size="lg">
                        <Link href="/admin/materials">Manage Materials</Link>
                    </Button>
                     <Button asChild variant="outline" size="lg">
                        <Link href="/admin/quizzes">Manage Quizzes</Link>
                    </Button>
                </div>
            </div>
            <div className="hidden md:block relative h-full min-h-[200px]">
                 <Image src="https://picsum.photos/seed/adminhero/400/300" alt="Admin working" layout="fill" objectFit="cover" data-ai-hint="teamwork collaboration"/>
            </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Learning Materials"
          value={isLoading ? "..." : learningMaterials.length}
          icon={FileText}
          description="Total published materials"
          link="/admin/materials"
          linkText="View Materials"
        />
        <StatCard
          title="Quizzes"
          value={isLoading ? "..." : quizzes.length}
          icon={ClipboardList}
          description="Total available quizzes"
          link="/admin/quizzes"
          linkText="View Quizzes"
        />
        <StatCard
          title="Announcements"
          value={isLoading ? "..." : announcements.length}
          icon={Megaphone}
          description="Total active announcements"
          link="/admin/announcements"
          linkText="View Announcements"
        />
         <StatCard
          title="User Messages"
          value={isLoading ? "..." : adminMessages.filter(m => !m.isRead).length}
          icon={Users}
          description="Unread messages from users"
          // link="/admin/messages" Add this link when messages page is built
          // linkText="View Messages"
        />
      </div>

      {/* Placeholder for recent activity or quick actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="w-full py-6 text-base">
            <Link href="/admin/materials?action=add"><FileText className="mr-2 h-5 w-5"/> Add New Material</Link>
          </Button>
          <Button asChild variant="outline" className="w-full py-6 text-base">
            <Link href="/admin/quizzes?action=add"><ClipboardList className="mr-2 h-5 w-5"/> Add New Quiz</Link>
          </Button>
          <Button asChild variant="outline" className="w-full py-6 text-base">
            <Link href="/admin/announcements?action=add"><Megaphone className="mr-2 h-5 w-5"/> Post Announcement</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
