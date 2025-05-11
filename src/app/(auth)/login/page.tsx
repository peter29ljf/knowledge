'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpenCheck } from 'lucide-react';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || (!isLoading && user) ) { // Show loading or nothing if already redirecting
    return (
      <div className="flex h-screen items-center justify-center">
        <BookOpenCheck className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center space-x-2 text-primary">
        <BookOpenCheck className="h-10 w-10" />
        <h1 className="text-4xl font-bold">StudyQuest</h1>
      </div>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back!</CardTitle>
          <CardDescription>Please select your role to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} StudyQuest. Conquer your learning goals!</p>
      </footer>
    </div>
  );
}
