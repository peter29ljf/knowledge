'use client';
import { useState, useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import type { Announcement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format, parseISO } from 'date-fns';
import { Megaphone, PlusCircle, Edit2, Trash2, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';


export default function AdminAnnouncementsPage() {
  const { announcements, addAnnouncement, fetchAllAdminContent, isLoading, deleteAnnouncement, updateAnnouncement } = useAppData();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // For simplicity, delete is not fully implemented on backend, this will be UI only for now
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAllAdminContent();
  }, [fetchAllAdminContent]);
  
  useEffect(() => {
    // Sort by publishedAt descending
    setAnnouncementsList([...announcements].sort((a, b) => b.publishedAt - a.publishedAt));
  }, [announcements]);

  // 检查URL参数是否要求打开添加公告模态窗口
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenModal();
    }
  }, [searchParams]);

  const handleOpenModal = (announcement?: Announcement) => {
    if (announcement) {
      setCurrentAnnouncement({ 
        id: announcement.id,
        message: announcement.message, 
        date: announcement.date,
        publishedAt: announcement.publishedAt
      });
      setIsEditing(true);
    } else {
      setCurrentAnnouncement({ message: '', date: format(new Date(), 'yyyy-MM-dd') });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!currentAnnouncement.message || !currentAnnouncement.date) {
      toast({ title: "Error", description: "Message and date are required for an announcement.", variant: "destructive" });
      return;
    }
    
    try {
      if (isEditing) {
        // 完整的公告对象需要id和publishedAt，确保它们已经存在
        if (!currentAnnouncement.id || !currentAnnouncement.publishedAt) {
          toast({ title: "Error", description: "Missing required announcement information for editing.", variant: "destructive" });
          return;
        }
        
        const updatedAnnouncement = await updateAnnouncement(currentAnnouncement as Announcement);
        if (updatedAnnouncement) {
          toast({ title: "Success", description: "Announcement has been updated." });
          await fetchAllAdminContent(); // 刷新列表
        } else {
          toast({ title: "Error", description: "Failed to update announcement. It may not exist.", variant: "destructive" });
        }
      } else {
        await addAnnouncement({
          message: currentAnnouncement.message,
          date: currentAnnouncement.date
        });
        toast({ title: "Success", description: "New announcement has been published." });
      }
      setIsModalOpen(false);
      setCurrentAnnouncement({});
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast({ title: "Error", description: "An error occurred while saving the announcement.", variant: "destructive" });
    }
  };
  
  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      const success = await deleteAnnouncement(announcementId);
      toast({ title: "Success", description: "Announcement has been successfully deleted." });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({ title: "Error", description: "An error occurred while deleting the announcement.", variant: "destructive" });
    }
  }
  
  const filteredAnnouncements = announcementsList.filter(announcement => 
    announcement.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    announcement.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center"><Megaphone className="mr-2 h-6 w-6" />Manage Announcements</CardTitle>
            <CardDescription>Create, view, or delete announcements for users.</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> New Announcement
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search announcements by message or date (YYYY-MM-DD)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base py-6"
              />
            </div>
          </div>

          {isLoading ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          ) : filteredAnnouncements.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No announcements found. {searchTerm && "Try a different search."}</p>
          ) : (
            <ScrollArea className="h-[500px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Published Date</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[150px]">Effective Date</TableHead>
                    <TableHead className="w-[150px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnnouncements.map((announcement) => (
                    <TableRow key={announcement.id}>
                      <TableCell>{format(new Date(announcement.publishedAt), 'PPp')}</TableCell>
                      <TableCell className="font-medium truncate max-w-md" title={announcement.message}>{announcement.message}</TableCell>
                      <TableCell>{format(new Date(announcement.date), 'PP')}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(announcement)}>
                          <Edit2 className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm">
                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this announcement.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteAnnouncement(announcement.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? 'Edit' : 'New'} Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Enter the message for the announcement. It will be shown to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="announcement-date">Effective Date (for content reference)</Label>
               <Input 
                type="date" 
                id="announcement-date"
                value={currentAnnouncement.date || format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setCurrentAnnouncement(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="announcement-message">Message</Label>
              <Textarea
                id="announcement-message"
                value={currentAnnouncement.message || ''}
                onChange={(e) => setCurrentAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                rows={5}
                className="mt-1"
                placeholder="Enter announcement message..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveAnnouncement}>Publish Announcement</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
