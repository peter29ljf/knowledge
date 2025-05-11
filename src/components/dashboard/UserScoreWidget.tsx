'use client';

import { useAppData } from '@/contexts/AppDataContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

export default function UserScoreWidget() {
  const { userScore, isLoading } = useAppData();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <div>
      <div className="text-4xl font-bold text-primary flex items-center">
        {userScore.score} 
        <Star className="h-7 w-7 ml-2 fill-yellow-400 text-yellow-500" />
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Keep learning to earn more points! Reach 1000 for a grand prize.
      </p>
    </div>
  );
}
