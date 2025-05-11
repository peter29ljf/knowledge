'use client';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAppData } from '@/contexts/AppDataContext';
import type { Quiz, QuizQuestion } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { Loader2, ListChecks, CalendarIcon, AlertTriangle, CheckCircle, XCircle, Clock, PlayCircle, HelpCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const QUIZ_DURATION_MINUTES = 3;

export default function QuizPage() {
  const { fetchQuiz, updateUserScore, isLoading: appDataLoading } = useAppData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'submitted'>('idle');
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizState('idle');
    setTimeLeft(QUIZ_DURATION_MINUTES * 60);
    setShowResults(false);
    setScore(0);
  };
  
  const loadQuiz = useCallback(async () => {
    if (selectedDate) {
      resetQuizState();
      setIsLoadingQuiz(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const fetchedQuiz = await fetchQuiz(dateString);
      setQuiz(fetchedQuiz || null);
      if (fetchedQuiz) {
        setAnswers(new Array(fetchedQuiz.questions.length).fill(-1));
      }
      setIsLoadingQuiz(false);
    }
  }, [selectedDate, fetchQuiz]);


  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  useEffect(() => {
    if (quizState !== 'active' || timeLeft <= 0) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [quizState, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && quizState === 'active') {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizState]); // Simplified handleSubmitQuiz call, need to ensure it's stable or wrapped in useCallback if it depends on many states

  const handleStartQuiz = () => {
    setQuizState('active');
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quiz) return;
    setQuizState('submitted');
    let calculatedScore = 0;
    const isToday = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;
    const withinTime = timeLeft > 0;

    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) {
        calculatedScore += (isToday && withinTime) ? 5 : 1;
      }
    });
    setScore(calculatedScore);
    updateUserScore(calculatedScore, isToday, withinTime); // Pass relevant info
    setShowResults(true);
  };
  
  const currentQuestion: QuizQuestion | undefined = quiz?.questions[currentQuestionIndex];

  const DatePicker = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal text-base py-6">
          <CalendarIcon className="mr-2 h-5 w-5" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
      </PopoverContent>
    </Popover>
  );

  if (isLoadingQuiz || appDataLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!quiz) {
    return (
      <div className="space-y-8">
         <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-3xl font-bold flex items-center"><ListChecks className="mr-3 h-8 w-8 text-primary" /> Daily Quiz</CardTitle>
              <CardDescription className="text-lg">Test your knowledge. Select a date to start a quiz.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6"><DatePicker /></div>
              <div className="flex flex-col items-center justify-center h-64 text-center bg-muted/50 p-8 rounded-lg shadow">
                <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
                <p className="text-xl font-semibold">No quiz found for this date.</p>
                <p className="text-muted-foreground">Please select another date or check back later.</p>
              </div>
            </CardContent>
         </Card>
      </div>
    );
  }
  
  if (quizState === 'idle') {
    return (
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center"><ListChecks className="mr-3 h-8 w-8 text-primary" /> {quiz.title}</CardTitle>
            <CardDescription className="text-lg">Quiz for: {format(parseISO(quiz.date), "PPP")}. Ready to test your knowledge?</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
            <div className="mb-6 flex justify-center"><DatePicker /></div>
            <p className="text-xl">This quiz has {quiz.questions.length} questions.</p>
            <p className="text-lg">You'll have {QUIZ_DURATION_MINUTES} minutes to complete it.</p>
            <Button onClick={handleStartQuiz} size="lg" className="text-xl py-8 px-10 shadow-md hover:shadow-lg transition-shadow">
                <PlayCircle className="mr-2 h-6 w-6" /> Start Quiz
            </Button>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="space-y-6">
       <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">{quiz.title}</CardTitle>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5"/>
                  <span>Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>
            <Progress value={progressPercentage} className="w-full h-3 mt-2" />
        </CardHeader>
        <CardContent>
          {currentQuestion && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">{currentQuestion.questionText}</h3>
              <RadioGroup value={answers[currentQuestionIndex]?.toString()} onValueChange={(value) => handleAnswerSelect(parseInt(value))} className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary">
                    <RadioGroupItem value={index.toString()} id={`q${currentQuestionIndex}-o${index}`} />
                    <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="text-base flex-1 cursor-pointer">{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
          <div className="mt-8 flex justify-between">
            <Button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} variant="outline" size="lg">Previous</Button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button onClick={handleNextQuestion} size="lg">Next</Button>
            ) : (
              <Button onClick={handleSubmitQuiz} size="lg" variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground">Submit Quiz</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="max-w-2xl w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Quiz Results</AlertDialogTitle>
            <AlertDialogDescription>
              You scored {score} out of {quiz.questions.length * ((selectedDate ? format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false) && timeLeft > 0 ? 5 : 1)} points.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-[400px] p-1 pr-4 rounded-md border bg-secondary/10">
            <div className="space-y-4 p-4">
            {quiz.questions.map((q, index) => (
              <Card key={q.id} className={`shadow-sm ${answers[index] === q.correctOptionIndex ? 'border-green-500' : 'border-red-500'}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    {answers[index] === q.correctOptionIndex ? <CheckCircle className="h-5 w-5 mr-2 text-green-500" /> : <XCircle className="h-5 w-5 mr-2 text-red-500" />}
                    Question {index + 1}: {q.questionText}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Your answer: <span className={`font-semibold ${answers[index] === q.correctOptionIndex ? 'text-green-600' : 'text-red-600'}`}>{q.options[answers[index]]?.text || "Not answered"}</span></p>
                  <p>Correct answer: <span className="font-semibold text-green-600">{q.options[q.correctOptionIndex].text}</span></p>
                  <details className="mt-1">
                      <summary className="cursor-pointer text-primary hover:underline flex items-center">
                        <HelpCircle className="h-4 w-4 mr-1" /> Explanation
                      </summary>
                      <p className="mt-1 p-2 bg-background rounded text-muted-foreground">{q.explanation}</p>
                  </details>
                </CardContent>
              </Card>
            ))}
            </div>
          </ScrollArea>
          <AlertDialogFooter>
            <Button onClick={() => { setShowResults(false); loadQuiz();}} className="w-full text-lg py-3">Close</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
