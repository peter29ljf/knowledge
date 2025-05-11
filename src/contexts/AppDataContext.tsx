// @ts-nocheck
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { LearningMaterial, Quiz, Announcement, UserScoreData, AdminMessage, QuizAttempt } from '@/lib/types';
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
  updateUserScore: (
    pointsToAddToGlobalScore: number,
    quizDate: string,
    userAnswers: number[],
    scoreForThisQuizAttempt: number
  ) => void;
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
  const [userScore, setUserScore] = useLocalStorage<UserScoreData>(
    `studyquest-userscore-${user?.id || 'guest'}`, 
    { score: 0, quizAttempts: {} } // Default includes empty quizAttempts object
  );
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
  }, [toast]); // toast is stable from useToast

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  useEffect(() => {
    const newKey = `studyquest-userscore-${user?.id || 'guest'}`;
    const storedData = localStorage.getItem(newKey);
    if (storedData) {
      try {
        setUserScore(JSON.parse(storedData));
      } catch (e) {
        console.error("Failed to parse user score from localStorage", e);
        setUserScore({ score: 0, quizAttempts: {} });
      }
    } else {
      setUserScore({ score: 0, quizAttempts: {} });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, setUserScore]);


  const fetchLearningMaterial = useCallback(async (date: string): Promise<LearningMaterial | undefined> => {
    // learningMaterials is a dependency, so this function reference changes when learningMaterials change.
    return learningMaterials.find(m => m.date === date) || dataService.getLearningMaterialByDate(date);
  }, [learningMaterials]);

  const fetchQuiz = useCallback(async (date: string): Promise<Quiz | undefined> => {
    // quizzes is a dependency.
    return quizzes.find(q => q.date === date) || dataService.getQuizByDate(date);
  }, [quizzes]);

  const updateUserScore: AppDataContextType['updateUserScore'] = useCallback((
    pointsToAddToGlobalScore,
    quizDate,
    userAnswers,
    scoreForThisQuizAttempt
  ) => {
    setUserScore(prevScoreData => {
      let newGlobalTotalScore = prevScoreData.score + pointsToAddToGlobalScore;
      // let grandPrizeReached = false; // Not used

      if (newGlobalTotalScore >= GRAND_PRIZE_THRESHOLD) {
        toast({
          title: "Congratulations!",
          description: `You've reached ${newGlobalTotalScore} points and won a grand prize! Your score will now reset.`,
          variant: "default",
          duration: 10000,
        });
        newGlobalTotalScore = 0; // Reset score
        // grandPrizeReached = false; // Not used
      }

      const newAttempts: Record<string, QuizAttempt> = {
        ...(prevScoreData.quizAttempts || {}),
        [quizDate]: {
          quizDate,
          score: scoreForThisQuizAttempt,
          answers: userAnswers,
          timestamp: Date.now(),
        },
      };
      return { score: newGlobalTotalScore, quizAttempts: newAttempts };
    });
  }, [setUserScore, toast]); // GRAND_PRIZE_THRESHOLD is a constant

  const sendAdminMessage = useCallback(async (message: string) => {
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
  }, [user, setAdminMessages, toast]);

  const markAdminMessageAsRead = useCallback((messageId: string) => {
    setAdminMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg));
  }, [setAdminMessages]);

  // Admin functions
  const addLearningMaterial: AppDataContextType['addLearningMaterial'] = useCallback(async (material) => {
    await dataService.addLearningMaterial(material);
    await loadInitialData(); // Refresh data
    toast({ title: "Success", description: "Learning material added." });
  }, [loadInitialData, toast]);

  const addQuiz: AppDataContextType['addQuiz'] = useCallback(async (quiz) => {
    await dataService.addQuiz(quiz);
    await loadInitialData();
    toast({ title: "Success", description: "Quiz added." });
  }, [loadInitialData, toast]);

  const addAnnouncement: AppDataContextType['addAnnouncement'] = useCallback(async (announcement) => {
    await dataService.addAnnouncement(announcement);
    await loadInitialData();
    toast({ title: "Success", description: "Announcement published." });
  }, [loadInitialData, toast]);
  
  const fetchAllAdminContent = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);


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
