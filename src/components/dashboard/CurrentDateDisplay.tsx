'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

export default function CurrentDateDisplay() {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(format(new Date(), 'EEEE, MMMM do, yyyy'));
  }, []);

  if (!currentDate) {
    return <div className="text-lg text-muted-foreground">Loading date...</div>;
  }

  return (
    <div className="flex items-center space-x-2 p-4 bg-secondary/50 rounded-lg shadow">
      <CalendarDays className="h-6 w-6 text-primary" />
      <p className="text-lg font-semibold text-foreground">
        Today is <span className="text-primary">{currentDate}</span>
      </p>
    </div>
  );
}
