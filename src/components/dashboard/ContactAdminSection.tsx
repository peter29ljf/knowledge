'use client';

import { useState } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PaperPlaneIcon } from '@radix-ui/react-icons'; // Using Radix icon as Send not in Lucide


export default function ContactAdminSection() {
  const { sendAdminMessage } = useAppData();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setIsSending(true);
    await sendAdminMessage(message);
    setMessage('');
    setIsSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="adminMessage" className="text-base font-medium">Your Message</Label>
        <Textarea
          id="adminMessage"
          placeholder="Type your message to the administrator here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-2 text-base"
          disabled={isSending}
        />
        <p className="text-xs text-muted-foreground mt-1">Your name will be automatically included.</p>
      </div>
      <Button type="submit" disabled={isSending || !message.trim()} className="w-full sm:w-auto text-base py-3 px-6">
        {isSending ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <PaperPlaneIcon className="mr-2 h-5 w-5" /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}
