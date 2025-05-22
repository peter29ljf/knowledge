// @ts-check
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
  updateLearningMaterial: (material: LearningMaterial) => Promise<LearningMaterial | undefined>;
  addQuiz: (quiz: Omit<Quiz, 'id'>) => Promise<void>;
  updateQuiz: (quiz: Quiz) => Promise<Quiz | undefined>;
  addAnnouncement: (announcement: Omit<Announcement, 'id'|'publishedAt'>) => Promise<void>;
  updateAnnouncement: (announcement: Announcement) => Promise<Announcement | undefined>;
  fetchAllAdminContent: () => Promise<void>; // To refresh admin view
  deleteLearningMaterial: (materialId: string) => Promise<boolean>; // 添加删除学习材料的功能
  deleteQuiz: (quizId: string) => Promise<boolean>; // 添加删除测验的功能
  deleteAnnouncement: (announcementId: string) => Promise<boolean>; // 添加删除公告的功能
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // 修改这里，使用一个键值，而不是直接在useLocalStorage中使用变量
  const userScoreKey = `studyquest-userscore-${user?.id || 'guest'}`;
  const [userScore, setUserScore] = useLocalStorage<UserScoreData>(
    userScoreKey, 
    { score: 0, quizAttempts: {} } // Default includes empty quizAttempts object
  );
  
  const [adminMessages, setAdminMessages] = useLocalStorage<AdminMessage[]>('studyquest-adminmessages', []);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const GRAND_PRIZE_THRESHOLD = 1000;

  // 确保组件在客户端渲染之后再开始数据初始化
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 初始化数据存储并加载数据
  const initializeDataStorage = useCallback(async () => {
    if (!isInitialized && isHydrated) {
      try {
        // 触发API路由来初始化数据
        const response = await fetch('/api/init');
        const result = await response.json();
        console.log('数据初始化结果:', result);
        setIsInitialized(true);
      } catch (error) {
        console.error('调用初始化API时出错:', error);
      }
    }
  }, [isInitialized, isHydrated]);

  const loadInitialData = useCallback(async () => {
    if (!isHydrated) return; // 确保只在客户端执行
    
    setIsLoading(true);
    try {
      // 确保数据存储已初始化
      await initializeDataStorage();
      
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
      if (isHydrated) { // 确保只在客户端显示toast
        toast({ title: "Error", description: "Unable to load application data.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, initializeDataStorage, isHydrated]); // 添加isHydrated为依赖项

  useEffect(() => {
    if (isHydrated) {
      loadInitialData();
    }
  }, [loadInitialData, isHydrated]);

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
          description: `You've reached ${newGlobalTotalScore} points and won the grand prize! Your score will be reset.`,
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
    toast({ title: "Success", description: "Your message has been sent to the admin." });
  }, [user, setAdminMessages, toast]);

  const markAdminMessageAsRead = useCallback((messageId: string) => {
    setAdminMessages(prev => prev.map(msg => msg.id === messageId ? { ...msg, isRead: true } : msg));
  }, [setAdminMessages]);

  // 管理员功能
  const addLearningMaterial: AppDataContextType['addLearningMaterial'] = useCallback(async (material) => {
    await dataService.addLearningMaterial(material);
    await loadInitialData(); // 刷新数据
    toast({ title: "Success", description: "Learning material has been added." });
  }, [loadInitialData, toast]);

  const addQuiz: AppDataContextType['addQuiz'] = useCallback(async (quiz) => {
    await dataService.addQuiz(quiz);
    await loadInitialData();
    toast({ title: "Success", description: "Quiz has been added." });
  }, [loadInitialData, toast]);

  const addAnnouncement: AppDataContextType['addAnnouncement'] = useCallback(async (announcement) => {
    await dataService.addAnnouncement(announcement);
    await loadInitialData();
    toast({ title: "Success", description: "Announcement has been published." });
  }, [loadInitialData, toast]);
  
  // 添加删除功能
  const deleteLearningMaterial = useCallback(async (materialId: string) => {
    if (!isHydrated) return false; // 确保只在客户端执行
    
    try {
      const success = await dataService.deleteLearningMaterial(materialId);
      if (success) {
        await loadInitialData(); // 刷新数据
        toast({ title: "Success", description: "Learning material has been deleted." });
        return true;
      } else {
        toast({ title: "Error", description: "Failed to delete learning material.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error('Error deleting learning material:', error);
      toast({ title: "Error", description: "Failed to delete learning material.", variant: "destructive" });
      return false;
    }
  }, [loadInitialData, toast, isHydrated]);
  
  const deleteQuiz = useCallback(async (quizId: string) => {
    if (!isHydrated) return false; // 确保只在客户端执行
    
    try {
      const success = await dataService.deleteQuiz(quizId);
      if (success) {
        await loadInitialData();
        toast({ title: "Success", description: "Quiz has been deleted." });
        return true;
      } else {
        toast({ title: "Error", description: "Failed to delete quiz.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({ title: "Error", description: "Failed to delete quiz.", variant: "destructive" });
      return false;
    }
  }, [loadInitialData, toast, isHydrated]);
  
  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    if (!isHydrated) return false; // 确保只在客户端执行
    
    try {
      const success = await dataService.deleteAnnouncement(announcementId);
      if (success) {
        await loadInitialData();
        toast({ title: "Success", description: "Announcement has been deleted." });
        return true;
      } else {
        toast({ title: "Error", description: "Failed to delete announcement.", variant: "destructive" });
        return false;
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({ title: "Error", description: "Failed to delete announcement.", variant: "destructive" });
      return false;
    }
  }, [loadInitialData, toast, isHydrated]);
  
  const fetchAllAdminContent = useCallback(async () => {
    if (!isHydrated) return; // 确保只在客户端执行
    
    setIsLoading(true);
    try {
      const [materials, quizzesData, announcementsData] = await Promise.all([
        dataService.getAllLearningMaterials(),
        dataService.getAllQuizzes(),
        dataService.getAllAnnouncements(),
      ]);
      
      // 强制使用新的引用，确保状态更新
      setLearningMaterials([...materials]);
      setQuizzes([...quizzesData]);
      setAnnouncements([...announcementsData]);
      
      console.log('Admin content refreshed', {
        materialsCount: materials.length,
        quizzesCount: quizzesData.length,
        announcementsCount: announcementsData.length
      });
    } catch (error) {
      console.error('Error fetching admin content:', error);
      if (isHydrated) {
        toast({ title: "Error", description: "Failed to fetch content.", variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  }, [setLearningMaterials, setQuizzes, setAnnouncements, toast, isHydrated]);

  const updateLearningMaterial = useCallback(async (updatedMaterial: LearningMaterial): Promise<LearningMaterial | undefined> => {
    if (!isHydrated) return undefined; // 确保只在客户端执行
    
    try {
      const result = await dataService.updateLearningMaterial(updatedMaterial);
      if (result) {
        await loadInitialData(); // 刷新数据
        toast({ title: "Success", description: "Learning material has been updated." });
        return result;
      } else {
        toast({ title: "Error", description: "Failed to update learning material.", variant: "destructive" });
        return undefined;
      }
    } catch (error) {
      console.error('Error updating learning material:', error);
      toast({ title: "Error", description: "Failed to update learning material.", variant: "destructive" });
      return undefined;
    }
  }, [loadInitialData, toast, isHydrated]);
  
  const updateQuiz = useCallback(async (updatedQuiz: Quiz): Promise<Quiz | undefined> => {
    if (!isHydrated) return undefined; // 确保只在客户端执行
    
    try {
      const result = await dataService.updateQuiz(updatedQuiz);
      if (result) {
        await loadInitialData(); // 刷新数据
        toast({ title: "Success", description: "Quiz has been updated." });
        return result;
      } else {
        toast({ title: "Error", description: "Failed to update quiz.", variant: "destructive" });
        return undefined;
      }
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast({ title: "Error", description: "Failed to update quiz.", variant: "destructive" });
      return undefined;
    }
  }, [loadInitialData, toast, isHydrated]);

  const updateAnnouncement = useCallback(async (updatedAnnouncement: Announcement): Promise<Announcement | undefined> => {
    if (!isHydrated) return undefined; // 确保只在客户端执行
    
    try {
      // 由于原始公告模型中包含 publishedAt 字段，需要保留原始发布时间
      // 直接调用 dataService 更新公告
      const result = await dataService.updateAnnouncement(updatedAnnouncement);
      if (result) {
        await loadInitialData(); // 刷新数据
        toast({ title: "Success", description: "Announcement has been updated." });
        return result;
      } else {
        toast({ title: "Error", description: "Failed to update announcement.", variant: "destructive" });
        return undefined;
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({ title: "Error", description: "Failed to update announcement.", variant: "destructive" });
      return undefined;
    }
  }, [loadInitialData, toast, isHydrated]);

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
      updateLearningMaterial,
      addQuiz,
      updateQuiz,
      addAnnouncement,
      updateAnnouncement,
      fetchAllAdminContent,
      deleteLearningMaterial,
      deleteQuiz,
      deleteAnnouncement,
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
