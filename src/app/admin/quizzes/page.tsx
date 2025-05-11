'use client';
// This is a placeholder for Admin Quizzes page.
// Similar structure to AdminMaterialsPage can be adopted.
// Due to complexity of quiz and question editing, this will be a simplified version.

import { useState, useEffect } from 'react';
import { useAppData } from '@/contexts/AppDataContext';
import type { Quiz, QuizQuestion, QuizQuestionOption } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { ClipboardList, PlusCircle, Edit2, Trash2, CalendarIcon, Loader2, Search, MessageCircleQuestion, ListOrdered, CheckSquare } from 'lucide-react';
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

export default function AdminQuizzesPage() {
  const { quizzes, addQuiz, fetchAllAdminContent, isLoading } = useAppData();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<Partial<Quiz>>({ questions: [] });
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quizzesList, setQuizzesList] = useState<Quiz[]>([]);

  useEffect(() => {
    fetchAllAdminContent();
  }, [fetchAllAdminContent]);

  useEffect(() => {
    setQuizzesList(quizzes);
  }, [quizzes]);

  const handleOpenModal = (quiz?: Quiz) => {
    if (quiz) {
      setCurrentQuiz({ ...quiz, date: quiz.date || format(new Date(), 'yyyy-MM-dd'), questions: quiz.questions || [] });
      setIsEditing(true);
    } else {
      setCurrentQuiz({ date: format(new Date(), 'yyyy-MM-dd'), title: '', questions: [ { id: 'q1', questionText: '', options: [{text:''},{text:''}], correctOptionIndex: 0, explanation: ''} ] });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSaveQuiz = async () => {
    if (!currentQuiz.title || !currentQuiz.date || !currentQuiz.questions || currentQuiz.questions.length === 0) {
      toast({ title: "Error", description: "Title, date, and at least one question are required.", variant: "destructive" });
      return;
    }
    // Add validation for questions structure
    for (const q of currentQuiz.questions) {
        if (!q.questionText || q.options.length < 2 || q.options.some(opt => !opt.text.trim()) || !q.explanation) {
             toast({ title: "Error", description: `Question "${q.questionText || 'Untitled'}" is incomplete. Ensure all fields and at least 2 options are filled.`, variant: "destructive" });
             return;
        }
    }

    if (isEditing) {
      // await updateQuiz(currentQuiz as Quiz); // Requires implementation
      toast({ title: "Info", description: "Update functionality to be implemented." });
    } else {
      await addQuiz(currentQuiz as Omit<Quiz, 'id'>);
    }
    setIsModalOpen(false);
    setCurrentQuiz({ questions: [] });
  };
  
  const handleDeleteQuiz = (quizId: string) => {
    setQuizzesList(prev => prev.filter(q => q.id !== quizId));
    toast({ title: "Info", description: `Quiz ${quizId} would be deleted (UI only).`});
  };

  const handleQuestionChange = (qIndex: number, field: keyof QuizQuestion, value: any) => {
    const updatedQuestions = [...(currentQuiz.questions || [])];
    updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], [field]: value };
    setCurrentQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const updatedQuestions = [...(currentQuiz.questions || [])];
    const updatedOptions = [...(updatedQuestions[qIndex].options || [])];
    updatedOptions[optIndex] = { text: value };
    updatedQuestions[qIndex].options = updatedOptions;
    setCurrentQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  };
  
  const addQuestionField = () => {
    const newQuestion: QuizQuestion = { id: `q${Date.now()}`, questionText: '', options: [{text:''},{text:''}], correctOptionIndex: 0, explanation: '' };
    setCurrentQuiz(prev => ({ ...prev, questions: [...(prev.questions || []), newQuestion]}));
  }
  
  const removeQuestionField = (qIndex: number) => {
    setCurrentQuiz(prev => ({...prev, questions: prev.questions?.filter((_,idx) => idx !== qIndex)}));
  }
  
  const addOptionField = (qIndex: number) => {
    const updatedQuestions = [...(currentQuiz.questions || [])];
    updatedQuestions[qIndex].options = [...(updatedQuestions[qIndex].options || []), {text:''}];
    setCurrentQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  }
  
  const removeOptionField = (qIndex: number, optIndex: number) => {
     const updatedQuestions = [...(currentQuiz.questions || [])];
     updatedQuestions[qIndex].options = updatedQuestions[qIndex].options?.filter((_,idx) => idx !== optIndex);
     setCurrentQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  }

  const filteredQuizzes = quizzesList.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.date.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center"><ClipboardList className="mr-2 h-6 w-6" />Manage Quizzes</CardTitle>
            <CardDescription>Add, edit, or delete quizzes.</CardDescription>
          </div>
          <Button onClick={() => handleOpenModal()} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Quiz
          </Button>
        </CardHeader>
        <CardContent>
           <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search quizzes by title or date (YYYY-MM-DD)..."
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
          ) : filteredQuizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No quizzes found. {searchTerm && "Try a different search."}</p>
          ) : (
            <ScrollArea className="h-[500px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[100px]">Questions</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell>{format(new Date(quiz.date), 'PP')}</TableCell> {/* Ensure date is valid */}
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.questions.length}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(quiz)}>
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
                                This action cannot be undone. This will permanently delete the quiz "{quiz.title}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>
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

      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent className="sm:max-w-3xl w-full"> {/* Increased width for quiz form */}
          <AlertDialogHeader>
            <AlertDialogTitle>{isEditing ? 'Edit' : 'Add New'} Quiz</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="max-h-[70vh] p-1 pr-3"> {/* Added ScrollArea for long forms */}
            <div className="space-y-4 py-4">
                <div>
                <Label htmlFor="quiz-date">Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button id="quiz-date" variant="outline" className="w-full justify-start text-left font-normal mt-1">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {currentQuiz.date ? format(new Date(currentQuiz.date), "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={currentQuiz.date ? new Date(currentQuiz.date) : undefined} onSelect={(date) => setCurrentQuiz(prev => ({ ...prev, date: date ? format(date, 'yyyy-MM-dd') : undefined }))} initialFocus /></PopoverContent>
                </Popover>
                </div>
                <div>
                <Label htmlFor="quiz-title">Title</Label>
                <Input id="quiz-title" value={currentQuiz.title || ''} onChange={(e) => setCurrentQuiz(prev => ({ ...prev, title: e.target.value }))} className="mt-1" placeholder="Quiz Title" />
                </div>
                
                <h4 className="text-lg font-semibold pt-4 border-t mt-4">Questions</h4>
                {currentQuiz.questions?.map((q, qIndex) => (
                <Card key={`q-${qIndex}`} className="p-4 space-y-3 bg-secondary/30">
                    <div className="flex justify-between items-center">
                        <Label className="text-base">Question {qIndex + 1}</Label>
                        <Button variant="ghost" size="sm" onClick={() => removeQuestionField(qIndex)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4 mr-1"/>Remove Question</Button>
                    </div>
                    <Textarea placeholder="Question text" value={q.questionText} onChange={e => handleQuestionChange(qIndex, 'questionText', e.target.value)} />
                    <Label className="text-sm">Options</Label>
                    {q.options.map((opt, optIndex) => (
                        <div key={`q${qIndex}-opt${optIndex}`} className="flex items-center space-x-2">
                        <Input placeholder={`Option ${optIndex + 1}`} value={opt.text} onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)} />
                        <Button variant="ghost" size="icon" onClick={() => removeOptionField(qIndex, optIndex)} disabled={q.options.length <= 2} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOptionField(qIndex)}>Add Option</Button>
                    <div>
                        <Label>Correct Option (Index, starts from 0)</Label>
                        <Input type="number" min="0" max={(q.options.length || 1) -1} placeholder="Correct Option Index" value={q.correctOptionIndex ?? ''} onChange={e => handleQuestionChange(qIndex, 'correctOptionIndex', parseInt(e.target.value))} />
                    </div>
                    <Textarea placeholder="Explanation" value={q.explanation} onChange={e => handleQuestionChange(qIndex, 'explanation', e.target.value)} />
                </Card>
                ))}
                <Button variant="outline" onClick={addQuestionField} className="w-full"><PlusCircle className="mr-2 h-4 w-4"/>Add Another Question</Button>
            </div>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsModalOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveQuiz}>Save Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
