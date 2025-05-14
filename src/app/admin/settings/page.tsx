'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings, TrashIcon, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearAllData } from '@/lib/dataService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      const success = await clearAllData();
      if (success) {
        toast({ 
          title: "成功", 
          description: "所有数据已清除。应用已重置为初始状态。",
        });
      } else {
        toast({ 
          title: "错误", 
          description: "清除数据失败。请重试。", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error('清除数据时出错:', error);
      toast({ 
        title: "错误", 
        description: "清除数据时发生错误。", 
        variant: "destructive" 
      });
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleReloadPage = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Settings className="mr-2 h-6 w-6" />管理设置
          </CardTitle>
          <CardDescription>
            管理应用程序设置和数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">数据管理</h3>
            <p className="text-sm text-muted-foreground">
              以下操作将影响整个应用程序的数据。请谨慎操作。
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <TrashIcon size={18} />
                    清除所有数据
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确认清除所有数据？</AlertDialogTitle>
                    <AlertDialogDescription>
                      此操作将清除所有学习材料、测验和公告数据。此操作不可撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearAllData} disabled={isClearing}>
                      {isClearing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          正在清除...
                        </>
                      ) : "确认清除"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" className="gap-2" onClick={handleReloadPage}>
                <RefreshCw size={18} />
                刷新页面
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">应用信息</h3>
            <div className="rounded-md bg-muted p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div className="font-medium">应用名称</div>
                <div>StudyQuest</div>
                <div className="font-medium">版本</div>
                <div>1.0.0</div>
                <div className="font-medium">数据存储</div>
                <div>浏览器本地存储 (localStorage)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 