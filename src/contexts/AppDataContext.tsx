'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { LearningMaterial, Quiz, Announcement, UserScoreData, AdminMessage } from '@/lib/types';
import * as dataService from '@/lib/dataService';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useAuth } from './AuthContext'; // To associate score with user
import { useToast } from "@/hooks/use-toast";


interface AppDataContextType {
  learningMaterials: LearningMaterial[];
  quizzes: Quiz[];
  announcements: Announcement[];
  userScore: UserScoreData;
  adminMessages: AdminMessage[];
  isLoading: boolean;
  fetchLearningMaterial: (date: string) => Promise<LearningMaterial | undefined>;
  fetchQuiz: (date: string) => Promise<Quiz | undefined>;
  updateUserScore: (points: number, isTodaysQuiz: boolean, withinTime: boolean) => void;
  sendAdminMessage: (message: string) => Promise<void>;
  markAdminMessageAsRead: (messageId: string) => void;
  // Admin specific functions (could be moved to an AdminContext if app grows)
  addLearningMaterial: (material: Omit<LearningMaterial, 'id'>) => Promise<void>;
  addQuiz: (quiz: Omit<Quiz, 'id'>) => Promise<void>;
  addAnnouncement: (announcement: Omit<Announcement, 'id'|'publishedAt'>) => Promise<void>;
  fetchAllAdminContent: () => Promise<void>; // To refresh admin view
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userScore, setUserScore] = useLocalStorage<UserScoreData>(`studyquest-userscore-${user?.id || 'guest'}`, { score: 0 });
  const [adminMessages, setAdminMessages] = useLocalStorage<AdminMessage[]>('studyquest-adminmessages', []);
  const [isLoading, setIsLoading] = useState(true);

  const GRAND_PRIZE_THRESHOLD = 1000;

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [materials, quizzesData, announcementsData] = await Promise.all([
        dataService.getAllLearningMaterials(),
        dataService.getAllQuizzes(),
        dataService.getAnnouncements(),
      ]);
      setLearningMaterials(materials);
      setQuizzes(quizzesData);
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error("Failed to load initial data", error);
      toast({ title: "Error", description: "Could not load app data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  // Update localStorage key for userScore when user changes
  useEffect(() => {
    // This effect will run when `user` changes, effectively re-initializing `userScore` for the new user.
    // `useLocalStorage` itself doesn't automatically re-initialize with a new key,
    // so we might need to manually trigger a read or ensure the key dependency is handled if we want to switch users smoothly.
    // For now, this setup means score is tied to the user ID in the key.
    // If user logs out and logs in as someone else, a new `useLocalStorage` instance with a new key will be used.
    // If the same user logs in, their previous score will be loaded.
    // Consider resetting or loading score explicitly on login/logout if needed beyond this.
  }, [user]);


  const fetchLearningMaterial = async (date: string): Promise<LearningMaterial | undefined> => {
    // For dynamic fetching, or if materials list is very large.
    // For now, finds from loaded state.
    return learningMaterials.find(m => m.date === date) || dataService.getLearningMaterialByDate(date);
  };

  const fetchQuiz = async (date: string): Promise<Quiz | undefined> => {
    return quizzes.find(q => q.date === date) || dataService.getQuizByDate(date);
  };

  const updateUserScore = (points: number) => {
    setUserScore(prevScore => {
      const newTotalScore = prevScore.score + points;
      if (newTotalScore >= GRAND_PRIZE_THRESHOLD) {
        toast({
          title: "Congratulations!",
          description: `You've reached ${newTotalScore} points and won a grand prize! Your score will now reset.`,
          variant: "default",
          duration: 10000,
        });
        return { score: 0 }; // Reset score
      }
      return { score: newTotalScore };
    });
  };
  
  const sendAdminMessage = async (message: string) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to send a message.", variant: "destructive" });
      return;
    }
    const newMessage: AdminMessage = {
      id: `msg-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      message,
      timestamp: Date.now(),
    };
    setAdminMessages(prev => [newMessage, ...prev]);
    toast({ title: "Success", description: "Your message has been sent to the administrator." });
  };

  const markAdminMessageAsRead = (messageId: string) => {
    setAdminMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg));
  };

  // Admin functions
  const addLearningMaterial: AppDataContextType['addLearningMaterial'] = async (material) => {
    await dataService.addLearningMaterial(material);
    await loadInitialData(); // Refresh data
    toast({ title: "Success", description: "Learning material added." });
  };

  const addQuiz: AppDataContextType['addQuiz'] = async (quiz) => {
    await dataService.addQuiz(quiz);
    await loadInitialData();
    toast({ title: "Success", description: "Quiz added." });
  };

  const addAnnouncement: AppDataContextType['addAnnouncement'] = async (announcement) => {
    await dataService.addAnnouncement(announcement);
    await loadInitialData();
    toast({ title: "Success", description: "Announcement published." });
  };
  
  const fetchAllAdminContent = async () => {
    await loadInitialData();
  };


  return (
    <AppDataContext.Provider value={{
      learningMaterials,
      quizzes,
      announcements,
      userScore,
      adminMessages,
      isLoading,
      fetchLearningMaterial,
      fetchQuiz,
      updateUserScore,
      sendAdminMessage,
      markAdminMessageAsRead,
      addLearningMaterial,
      addQuiz,
      addAnnouncement,
      fetchAllAdminContent,
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = (): AppDataContextType => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
