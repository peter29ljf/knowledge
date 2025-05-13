'use client';

import type { User, UserRole } from '@/lib/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (role: UserRole, name?: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User | null>('studyquest-user', null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 添加日志以追踪加载状态
    console.log('AuthProvider初始化，正在加载用户数据');
    
    try {
      // 确保localStorage读取不会阻塞
      setTimeout(() => {
        console.log('AuthProvider加载完成，user:', user);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('加载用户数据时出错:', error);
      setIsLoading(false);
    }
    
    // 添加安全机制，确保加载状态不会永远卡住
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('AuthProvider加载超时，强制设置为完成状态');
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = (role: UserRole, name: string = 'User') => {
    const userId = role === 'admin' ? 'admin001' : `user-${Date.now()}`;
    const loggedInUser: User = { id: userId, role, name: role === 'admin' ? 'Administrator' : name };
    
    try {
      setUser(loggedInUser);
      setIsLoading(false);
      console.log('用户登录成功:', loggedInUser);
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('登录过程中出错:', error);
      // 即使出错也确保loading状态结束
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      console.log('用户已登出');
      router.push('/login');
    } catch (error) {
      console.error('登出过程中出错:', error);
      // 强制刷新页面以确保状态重置
      window.location.href = '/login';
    }
  };
  
  // Effect to handle redirection if user state changes (e.g. manual localStorage clear)
  useEffect(() => {
    console.log('用户状态变更 - isLoading:', isLoading, 'user:', user, 'path:', typeof window !== 'undefined' ? window.location.pathname : 'unknown');
    
    if (!isLoading && !user && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      console.log('未登录用户，重定向到登录页');
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
