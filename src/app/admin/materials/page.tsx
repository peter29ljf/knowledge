'use client';
import { useState, useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import type { LearningMaterial } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, parseISO } from 'date-fns';
import { FileText, PlusCircle, Edit2, Trash2, CalendarIcon, Loader2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from "@/components/ui/alert-dialog"
import { useSearchParams } from 'next/navigation';


export default function AdminMaterialsPage() {
  const { learningMaterials, addLearningMaterial, fetchAllAdminContent, isLoading } = useAppData(); // Assuming update/delete will be added
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<LearningMaterial>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // For simplicity, delete is not fully implemented on backend, this will be UI only for now
  const [materialsList, setMaterialsList] = useState<LearningMaterial[]>([]);

  useEffect(() => {
    fetchAllAdminContent();
  }, [fetchAllAdminContent]);
  
  useEffect(() => {
    setMaterialsList(learningMaterials);
  }, [learningMaterials]);

  // 检查URL参数是否要求打开添加材料模态窗口
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenModal();
    }
  }, [searchParams]);

  const handleOpenModal = (material?: LearningMaterial) => {
    if (material) {
      setCurrentMaterial({ ...material, date: material.date || format(new Date(), 'yyyy-MM-dd')}); // Ensure date is string
      setIsEditing(true);
    } else {
      setCurrentMaterial({ date: format(new Date(), 'yyyy-MM-dd'), title: '', content: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveMaterial = async () => {
    if (!currentMaterial.title || !currentMaterial.content || !currentMaterial.date) {
      toast({ title: "Error", description: "Title, content, and date are required.", variant: "destructive" });
      return;
    }
    
    // Here you would call updateLearningMaterial or addLearningMaterial from context
    // For now, let's assume addLearningMaterial handles both new and updates based on ID (if context is extended)
    // Or, we add a specific update function to context and dataService.
    // For this scaffold, we'll focus on adding.
    if (isEditing) {
      // await updateLearningMaterial(currentMaterial as LearningMaterial); // Requires implementation
      toast({ title: "Info", description: "Update functionality to be implemented." });
    } else {
       await addLearningMaterial(currentMaterial as Omit<LearningMaterial, 'id'>);
    }
    setIsModalOpen(false);
    setCurrentMaterial({});
  };
  
  const handleDeleteMaterial = (materialId: string) => {
    // UI only delete for now
    setMaterialsList(prev => prev.filter(m => m.id !== materialId));
    toast({ title: "Info", description: `Material ${materialId} would be deleted (UI only).`});
  }
  
  const filteredMaterials = materialsList.filter(material => 
    material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center"><FileText className="mr-2 h-6 w-6" />Manage Learning Materials</CardTitle>
            <CardDescription>Add, edit, or delete learning materials.</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Material
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search materials by title, content, or date (YYYY-MM-DD)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-base py-6"
              />
            </div>
          </div>

          {isLoading ? (
             <div className="flex justify-center items-center py-10">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
             </div>
          ) : filteredMaterials.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No learning materials found. {searchTerm && "Try a different search."}</p>
          ) : (
            <ScrollArea className="h-[500px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>{format(parseISO(material.date), 'PP')}</TableCell>
                      <TableCell className="font-medium">{material.title}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(material)}>
                          <Edit2 className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm">
                                <Trash2 className="mr-1 h-4 w-4" /> Delete
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the material "{material.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMaterial(material.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Modal for Add/Edit Material - Using AlertDialog for simplicity, Dialog would be better for forms */}
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="sm:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? 'Edit' : 'Add New'} Learning Material</AlertDialogTitle>
            <AlertDialogDescription>
              Fill in the details for the learning material.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <Label htmlFor="material-date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="material-date"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentMaterial.date ? format(parseISO(currentMaterial.date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentMaterial.date ? parseISO(currentMaterial.date) : undefined}
                    onSelect={(date) => setCurrentMaterial(prev => ({ ...prev, date: date ? format(date, 'yyyy-MM-dd') : undefined }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="material-title">Title</Label>
              <Input
                id="material-title"
                value={currentMaterial.title || ''}
                onChange={(e) => setCurrentMaterial(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                placeholder="Enter material title"
              />
            </div>
            <div>
              <Label htmlFor="material-content">Content (Markdown/HTML supported)</Label>
              <Textarea
                id="material-content"
                value={currentMaterial.content || ''}
                onChange={(e) => setCurrentMaterial(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="mt-1"
                placeholder="Enter material content..."
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveMaterial}>Save Material</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
