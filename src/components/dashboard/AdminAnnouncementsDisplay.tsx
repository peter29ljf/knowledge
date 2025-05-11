'use client';

import { useAppData } from '@/contexts/AppDataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Info } from 'lucide-react';

export default function AdminAnnouncementsDisplay() {
  const { announcements, isLoading } = useAppData();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-5 w-5 rounded-full mt-1" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!announcements || announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-8">
        <AlertCircle className="h-12 w-12 mb-4" />
        <p className="text-lg font-medium">No announcements at the moment.</p>
        <p className="text-sm">Check back later for updates from the administrator.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64 pr-4"> {/* Added pr-4 to prevent scrollbar overlap */}
      <div className="space-y-4">
        {announcements.map((announcement, index) => (
          <div key={announcement.id} className="p-4 bg-background rounded-lg shadow border border-border transition-all hover:shadow-md">
            <div className="flex items-start space-x-3">
              <Info className={`h-5 w-5 mt-0.5 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
              <div className="flex-1">
                <p className={`text-sm ${index === 0 ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                  {announcement.message}
                </p>
                <div className="text-xs text-muted-foreground mt-1 flex items-center space-x-2">
                  <span>{formatDistanceToNow(new Date(announcement.publishedAt), { addSuffix: true })}</span>
                  {index === 0 && <Badge variant="default" className="bg-primary/10 text-primary">New</Badge>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
