'use client';

import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showPage, setShowPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('登录页面加载 - isLoading:', isLoading, 'user:', user);
    
    // 添加一个延迟，确保页面在任何情况下都会显示出来
    const timer = setTimeout(() => {
      setShowPage(true);
    }, 1000);
    
    try {
      if (!isLoading && user) {
        // 如果已登录，重定向到相应页面
        console.log('用户已登录，重定向到相应页面');
        if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
      } else if (!isLoading) {
        // 如果未登录且不在加载中，显示登录页面
        setShowPage(true);
      }
    } catch (err) {
      console.error('登录页面导航出错:', err);
      setError('应用导航出错，请刷新页面');
      setShowPage(true);
    }
    
    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  // 无论状态如何，在3秒后显示登录页
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!showPage) {
        console.warn('登录页面加载超时，强制显示');
        setShowPage(true);
      }
    }, 3000);
    
    return () => clearTimeout(fallbackTimer);
  }, [showPage]);

  // 显示加载状态或登录表单
  if (!showPage) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-lg">正在准备登录页面...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 px-4 sm:px-0">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">StudyQuest</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            您的每日学习伙伴
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {error}
            <button 
              className="ml-2 underline" 
              onClick={() => window.location.reload()}
            >
              刷新页面
            </button>
          </div>
        )}
        
        <LoginForm />

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>
            这是一个演示应用，选择任何角色继续。<br />
            <Link
              href="https://github.com/peter29ljf/knowledge"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              查看GitHub源码
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
