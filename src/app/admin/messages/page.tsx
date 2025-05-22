'use client';
import { useState, useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Users, Search, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { AdminMessage } from '@/lib/types';

export default function AdminMessagesPage() {
  const { adminMessages, markAdminMessageAsRead, fetchAllAdminContent, isLoading } = useAppData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [messageDetailsOpen, setMessageDetailsOpen] = useState(false);
  
  useEffect(() => {
    fetchAllAdminContent();
  }, [fetchAllAdminContent]);
  
  const filteredMessages = adminMessages
    .filter(message => 
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.userName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.timestamp - a.timestamp);
    
  const handleViewMessage = (message: AdminMessage) => {
    setSelectedMessage(message);
    setMessageDetailsOpen(true);
    
    // If message is unread, mark it as read
    if (!message.isRead) {
      markAdminMessageAsRead(message.id);
    }
  };
  
  const handleMarkAsRead = (messageId: string) => {
    markAdminMessageAsRead(messageId);
    toast({ 
      title: "Success", 
      description: "Message marked as read."
    });
  };
  
  // Function to generate a mailto link with the message content
  const generateMailtoLink = (message: AdminMessage) => {
    const subject = encodeURIComponent(`Re: Your message to StudyQuest`);
    const body = encodeURIComponent(`\n\n---- Original Message ----\n${message.message}`);
    return `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center">
              <Users className="mr-2 h-6 w-6" />User Messages
            </CardTitle>
            <CardDescription>View and manage messages from users.</CardDescription>
          </div>
          <Badge variant={filteredMessages.filter(m => !m.isRead).length > 0 ? "destructive" : "outline"}>
            {filteredMessages.filter(m => !m.isRead).length} Unread
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search messages by content or user name..."
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
          ) : filteredMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No user messages found. {searchTerm && "Try a different search."}</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Date</TableHead>
                    <TableHead className="w-[180px]">User</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow 
                      key={message.id} 
                      className={message.isRead ? "" : "bg-muted/30 font-medium"}
                    >
                      <TableCell>{format(new Date(message.timestamp), 'PPp')}</TableCell>
                      <TableCell>{message.userName}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={message.message}>
                          {message.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {message.isRead ? (
                          <Badge variant="outline" className="text-muted-foreground">Read</Badge>
                        ) : (
                          <Badge variant="secondary">Unread</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewMessage(message)}
                          >
                            View
                          </Button>
                          {!message.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsRead(message.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <AlertDialog open={messageDetailsOpen} onOpenChange={setMessageDetailsOpen}>
        <AlertDialogContent className="sm:max-w-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Message from {selectedMessage?.userName}</AlertDialogTitle>
            <AlertDialogDescription>
              Received on {selectedMessage && format(new Date(selectedMessage.timestamp), 'PPp')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <ScrollArea className="h-[200px] border rounded-md p-4 bg-muted/20">
              {selectedMessage?.message}
            </ScrollArea>
          </div>
          <AlertDialogFooter className="flex justify-between items-center">
            <Button
              variant="outline"
              asChild
            >
              <a href={selectedMessage ? generateMailtoLink(selectedMessage) : '#'} target="_blank" rel="noreferrer">
                Reply by Email
              </a>
            </Button>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 