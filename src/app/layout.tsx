import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'StudyQuest - Your Daily Learning Companion',
  description: 'Learn daily, take quizzes, and earn points with StudyQuest!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="ethereum-conflict-detector" strategy="beforeInteractive">
          {`
            // 检测并处理加密钱包冲突问题
            try {
              console.log("检测ethereum冲突...");
              if (window.ethereum) {
                console.log("已存在ethereum对象，备份以防止冲突");
                window._originalEthereum = window.ethereum;
              }
            } catch (error) {
              console.error("ethereum检测脚本出错:", error);
            }
          `}
        </Script>
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <AppDataProvider>
            {children}
            <Toaster />
          </AppDataProvider>
        </AuthProvider>
        
        <Script id="page-load-detector">
          {`
            try {
              console.log("页面加载完成");
              // 监测页面加载状态
              document.addEventListener('DOMContentLoaded', function() {
                console.log('DOM内容加载完成');
              });
              window.addEventListener('load', function() {
                console.log('窗口完全加载');
                // 检查是否有潜在的无限循环问题
                setTimeout(function() {
                  if (document.body.classList.contains('loading') || 
                      document.querySelector('.loader') || 
                      document.getElementById('loading-indicator')) {
                    console.warn('页面可能卡在加载状态，尝试强制刷新');
                    // 可以选择执行强制刷新或其他恢复操作
                  }
                }, 10000);
              });
            } catch (error) {
              console.error("页面加载检测脚本出错:", error);
            }
          `}
        </Script>
      </body>
    </html>
  );
}
