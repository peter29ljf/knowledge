'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppData } from '@/contexts/AppDataContext';
import type { LearningMaterial } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Loader2, BookOpen, CalendarIcon, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function LearningPage() {
  const { fetchLearningMaterial, isLoading: appDataLoading } = useAppData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);

  useEffect(() => {
    const loadMaterial = async () => {
      if (selectedDate) {
        setIsLoadingMaterial(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const fetchedMaterial = await fetchLearningMaterial(dateString);
        setMaterial(fetchedMaterial || null);
        setIsLoadingMaterial(false);
      }
    };
    loadMaterial();
  }, [selectedDate, fetchLearningMaterial]);

  const DatePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="w-[280px] justify-start text-left font-normal text-base py-6"
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center"><BookOpen className="mr-3 h-8 w-8 text-primary" /> Learning Materials</CardTitle>
          <CardDescription className="text-lg">
            Select a date to view the learning material for that day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <DatePicker />
          </div>

          {isLoadingMaterial || appDataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : material ? (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">{material.title}</CardTitle>
                <CardDescription>Material for: {format(parseISO(material.date), "PPP")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] p-1 pr-4 rounded-md border bg-secondary/30">
                   <div className="prose prose-lg max-w-none p-4" dangerouslySetInnerHTML={{ __html: material.content.replace(/\n/g, '<br />') }} />
                </ScrollArea>
                <div className="mt-6 flex justify-center">
                    <Image src={`https://picsum.photos/seed/${material.id}/600/300`} alt={material.title} width={600} height={300} className="rounded-lg shadow-lg" data-ai-hint="educational content"/>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-muted/50 p-8 rounded-lg shadow">
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-xl font-semibold">No material found for this date.</p>
              <p className="text-muted-foreground">Please select another date or check back later.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
