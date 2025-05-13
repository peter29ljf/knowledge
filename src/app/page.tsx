'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('HomePage useEffect - isLoading:', isLoading, 'user:', user);
    
    // 如果加载超过5秒仍然卡住，强制重定向到登录页
    const timeoutId = setTimeout(() => {
      console.log('导航超时，强制重定向到登录页面');
      router.replace('/login');
    }, 5000);

    if (!isLoading) {
      try {
        if (user) {
          if (user.role === 'admin') {
            console.log('重定向到admin页面');
            router.replace('/admin');
          } else {
            console.log('重定向到dashboard页面');
            router.replace('/dashboard');
          }
        } else {
          console.log('重定向到login页面');
          router.replace('/login');
        }
      } catch (error) {
        console.error('导航过程中出错:', error);
        router.replace('/login');
      }
    }
    
    return () => clearTimeout(timeoutId);
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">Loading StudyQuest...</p>
    </div>
  );
}
