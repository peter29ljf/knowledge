'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAppData } from '@/contexts/AppDataContext';
import type { LearningMaterial } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Loader2, BookOpen, CalendarIcon, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

export default function LearningPage() {
  const { fetchLearningMaterial, isLoading: appDataLoading } = useAppData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [material, setMaterial] = useState<LearningMaterial | null>(null);
  const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);

  useEffect(() => {
    const loadMaterial = async () => {
      if (selectedDate) {
        setIsLoadingMaterial(true);
        const dateString = format(selectedDate, 'yyyy-MM-dd');
        const fetchedMaterial = await fetchLearningMaterial(dateString);
        setMaterial(fetchedMaterial || null);
        setIsLoadingMaterial(false);
      }
    };
    loadMaterial();
  }, [selectedDate, fetchLearningMaterial]);

  const DatePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="w-[280px] justify-start text-left font-normal text-base py-6"
        >
          <CalendarIcon className="mr-2 h-5 w-5" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center"><BookOpen className="mr-3 h-8 w-8 text-primary" /> Learning Materials</CardTitle>
          <CardDescription className="text-lg">
            Select a date to view the learning material for that day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <DatePicker />
          </div>

          {isLoadingMaterial || appDataLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : material ? (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">{material.title}</CardTitle>
                <CardDescription>Material for: {format(parseISO(material.date), "PPP")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] p-1 pr-4 rounded-md border bg-secondary/30">
                  <div 
                    className="prose prose-lg max-w-none p-4" 
                    dangerouslySetInnerHTML={{ 
                      __html: (() => {
                        // 逐步处理文本内容，保证正确的替换顺序
                        let content = material.content;
                        
                        // 1. 处理Markdown风格表格
                        // 表格头部处理 (| xxx | yyy |)
                        content = content.replace(/\n\|(.*?)\|\n\|([-\s|]+)\|\n/g, (match, header, separator) => {
                          const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
                          const colCount = headers.length;
                          
                          let tableHeader = '<div class="overflow-x-auto mb-4"><table class="w-full border-collapse mb-4">';
                          tableHeader += '<thead class="bg-secondary/20"><tr>';
                          
                          headers.forEach((h: string) => {
                            tableHeader += `<th class="border border-border p-2 text-start font-bold">${h}</th>`;
                          });
                          
                          tableHeader += '</tr></thead><tbody>';
                          return tableHeader;
                        });
                        
                        // 表格行处理
                        content = content.replace(/\|(.*?)\|\n/g, (match, row) => {
                          if (row.includes('--') && row.includes('-')) {
                            // 这是表格分隔符行，忽略
                            return '';
                          }
                          
                          const cells = row.split('|').map((cell: string) => cell.trim()).filter(Boolean);
                          let tableRow = '<tr>';
                          
                          cells.forEach((cell: string) => {
                            // 检查粗体标记 **xxx**
                            cell = cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            tableRow += `<td class="border border-border p-2">${cell}</td>`;
                          });
                          
                          tableRow += '</tr>';
                          
                          // 检查是否是最后一行的表格
                          if (!/\|(.*?)\|\n/.test(content.substring(content.indexOf(match) + match.length))) {
                            tableRow += '</tbody></table></div>';
                          }
                          
                          return tableRow;
                        });
                        
                        // 2. 处理水平分隔线
                        content = content.replace(/\n---\n/g, '<hr class="my-6 border-border" />');
                        
                        // 3. 处理Markdown风格标题 (### 标题)
                        content = content.replace(/\n### (.*?)(?:\n|$)/g, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>\n');
                        content = content.replace(/\n#### (.*?)(?:\n|$)/g, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>\n');
                        
                        // 4. 处理Markdown风格粗体和斜体
                        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
                        
                        // 5. 处理Markdown风格项目符号列表
                        content = content.replace(/\n\s*\* (.*?)(?:\n|$)/g, '</p><p class="my-1 pl-4 flex"><span class="mr-2">•</span>$1</p>\n');
                        
                        // 6. 处理中文数字项目符号
                        content = content.replace(/\n(([1-9]|[一二三四五六七八九十])[.、．]|[a-zA-Z][.、．])\s+/g, 
                          '</p><p class="my-1 ml-4 flex"><span class="mr-2">$1</span>');
                          
                        // 7. 处理emoji符号，使其显示更加突出
                        content = content.replace(/([🔍🧠🔁])/g, '<span class="text-2xl">$1</span>');
                        
                        // 8. 处理连续段落 (多个换行)
                        content = content.replace(/\n\n+/g, '</p><p class="mb-4">');
                        
                        // 9. 处理单个换行 (最后处理)
                        content = content.replace(/\n/g, '<br /><span class="inline-block h-2"></span>');
                        
                        // 10. 确保整个内容被段落包裹
                        if (!content.startsWith('<')) {
                          content = '<p class="mb-4">' + content + '</p>';
                        }
                        
                        return content;
                      })()
                    }} 
                  />
                </ScrollArea>
                <div className="mt-6 flex justify-center">
                    <Image 
                      src={`https://picsum.photos/seed/${material.id}/600/300`} 
                      alt={material.title} 
                      width={600} 
                      height={300} 
                      className="rounded-lg shadow-lg" 
                      data-ai-hint="educational content"
                      priority
                      key={material.id}
                    />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center bg-muted/50 p-8 rounded-lg shadow">
              <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-xl font-semibold">No material found for this date.</p>
              <p className="text-muted-foreground">Please select another date or check back later.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
