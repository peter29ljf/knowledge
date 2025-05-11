// @ts-nocheck
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
import { Loader2, ListChecks, CalendarIcon, AlertTriangle, CheckCircle, XCircle, Clock, PlayCircle, HelpCircle, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const QUIZ_DURATION_MINUTES = 30; // Increased duration as feedback is per question

interface QuestionFeedback {
  isCorrect: boolean | null;
  selectedOption: number | null;
}

export default function QuizPage() {
  const { fetchQuiz, updateUserScore, isLoading: appDataLoading, userScore } = useAppData();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [quizState, setQuizState] = useState<'idle' | 'active' | 'submitted' | 'completed_previously'>('idle');
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_MINUTES * 60);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0); // Score for the current quiz attempt (e.g., X out of Y correct)
  const [feedback, setFeedback] = useState<QuestionFeedback[]>([]);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState<boolean[]>([]);


  const resetQuizState = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizState('idle');
    setTimeLeft(QUIZ_DURATION_MINUTES * 60);
    setShowResults(false);
    setScore(0);
    setIsQuestionAnswered([]);
    setFeedback([]);
  }, []);
  
  const loadQuiz = useCallback(async () => {
    if (selectedDate) {
      setIsLoadingQuiz(true);
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const fetchedQuiz = await fetchQuiz(dateString);
      setQuiz(fetchedQuiz || null);

      if (fetchedQuiz) {
        const previousAttempt = userScore.quizAttempts?.[dateString];
        if (previousAttempt) {
          setAnswers(previousAttempt.answers);
          setScore(previousAttempt.score);
          setQuizState('completed_previously');
          const prevFeedback = fetchedQuiz.questions.map((q, idx) => ({
            isCorrect: previousAttempt.answers[idx] === q.correctOptionIndex,
            selectedOption: previousAttempt.answers[idx],
          }));
          setFeedback(prevFeedback);
          setIsQuestionAnswered(new Array(fetchedQuiz.questions.length).fill(true));
        } else {
          resetQuizState(); // Call simpler reset
          setAnswers(new Array(fetchedQuiz.questions.length).fill(-1));
          setIsQuestionAnswered(new Array(fetchedQuiz.questions.length).fill(false));
          setFeedback(new Array(fetchedQuiz.questions.length).fill({ isCorrect: null, selectedOption: null }));
          setQuizState('idle');
        }
      } else {
        resetQuizState(); // No quiz found, reset
      }
      setIsLoadingQuiz(false);
    } else {
      setQuiz(null);
      resetQuizState();
    }
  }, [selectedDate, fetchQuiz, userScore.quizAttempts, resetQuizState]);


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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, quizState]); // handleSubmitQuiz is wrapped in useCallback if needed or deps are managed

  const handleStartQuiz = () => {
    setQuizState('active');
    setTimeLeft(QUIZ_DURATION_MINUTES * 60); // Reset timer on start
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestion || isQuestionAnswered[currentQuestionIndex]) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);

    const newIsQuestionAnswered = [...isQuestionAnswered];
    newIsQuestionAnswered[currentQuestionIndex] = true;
    setIsQuestionAnswered(newIsQuestionAnswered);

    const correct = optionIndex === currentQuestion.correctOptionIndex;
    const newFeedback = [...feedback];
    newFeedback[currentQuestionIndex] = { isCorrect: correct, selectedOption: optionIndex };
    setFeedback(newFeedback);
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

    let correctAnswersCount = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) {
        correctAnswersCount += 1;
      }
    });
    
    const scoreForThisQuizAttempt = correctAnswersCount;
    setScore(scoreForThisQuizAttempt);

    let pointsToAddToGlobalScore = scoreForThisQuizAttempt;
    const isToday = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false;
    const withinTime = timeLeft > 0;

    if (isToday && withinTime) {
      // Original logic: 5 points for correct answer on today's quiz within time, 1 otherwise.
      // Assuming 1 base point, 4 bonus points.
      pointsToAddToGlobalScore = 0; // Recalculate based on new understanding
      quiz.questions.forEach((q, index) => {
        if (answers[index] === q.correctOptionIndex) {
          pointsToAddToGlobalScore += (isToday && withinTime) ? 5 : 1;
        }
      });
    }
    
    updateUserScore(pointsToAddToGlobalScore, quiz.date, answers, scoreForThisQuizAttempt);
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

  if (!quiz && quizState !== 'completed_previously') {
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

  if (quizState === 'completed_previously' && quiz) {
    const previousAttempt = userScore.quizAttempts?.[quiz.date];
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold flex items-center"><ListChecks className="mr-3 h-8 w-8 text-primary" /> {quiz.title}</CardTitle>
          <CardDescription className="text-lg">Quiz for: {format(parseISO(quiz.date), "PPP")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
           <div className="mb-6 flex justify-center"><DatePicker /></div>
          <AlertTriangle className="h-16 w-16 text-primary mx-auto" />
          <p className="text-xl font-semibold">You have already completed this quiz.</p>
          {previousAttempt && (
            <p className="text-lg">
              You scored {previousAttempt.score} out of {quiz.questions.length} on {format(new Date(previousAttempt.timestamp), "PPPp")}.
            </p>
          )}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => { setShowResults(true); }} size="lg" variant="outline" className="text-lg py-6">
              View Your Answers
            </Button>
            <Button onClick={() => { setSelectedDate(new Date()); setQuiz(null); resetQuizState(); }} size="lg" className="text-lg py-6">
              Pick Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (quizState === 'idle' && quiz) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center"><ListChecks className="mr-3 h-8 w-8 text-primary" /> {quiz.title}</CardTitle>
            <CardDescription className="text-lg">Quiz for: {format(parseISO(quiz.date), "PPP")}. Ready to test your knowledge?</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6">
            <div className="mb-6 flex justify-center"><DatePicker /></div>
            <p className="text-xl">This quiz has {quiz.questions.length} questions.</p>
            <p className="text-lg">You'll have {QUIZ_DURATION_MINUTES} minutes to complete it once started.</p>
             <p className="text-sm text-muted-foreground">Feedback will be provided after each question.</p>
            <Button onClick={handleStartQuiz} size="lg" className="text-xl py-8 px-10 shadow-md hover:shadow-lg transition-shadow">
                <PlayCircle className="mr-2 h-6 w-6" /> Start Quiz
            </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!quiz) { // Should be caught by earlier checks, but as a fallback
     return <div>Loading quiz or quiz not found...</div>;
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
              <RadioGroup 
                value={answers[currentQuestionIndex]?.toString()} 
                onValueChange={(value) => handleAnswerSelect(parseInt(value))} 
                className="space-y-3"
                disabled={isQuestionAnswered[currentQuestionIndex]}
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 border rounded-md transition-colors 
                                              ${isQuestionAnswered[currentQuestionIndex] && index === currentQuestion.correctOptionIndex ? 'border-green-500 bg-green-500/10' : ''}
                                              ${isQuestionAnswered[currentQuestionIndex] && index === answers[currentQuestionIndex] && index !== currentQuestion.correctOptionIndex ? 'border-red-500 bg-red-500/10' : ''}
                                              ${!isQuestionAnswered[currentQuestionIndex] ? 'hover:bg-secondary/50 has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary' : ''}
                                              `}>
                    <RadioGroupItem value={index.toString()} id={`q${currentQuestionIndex}-o${index}`} disabled={isQuestionAnswered[currentQuestionIndex]} />
                    <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className={`text-base flex-1 ${isQuestionAnswered[currentQuestionIndex] ? 'cursor-default' : 'cursor-pointer'}`}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>

              {isQuestionAnswered[currentQuestionIndex] && feedback[currentQuestionIndex] && (
                <Card className={`mt-4 p-4 ${feedback[currentQuestionIndex]?.isCorrect ? 'bg-green-500/10 border-green-500' : 'bg-red-500/10 border-red-500'}`}>
                  <CardHeader className="p-0 pb-2">
                    <CardTitle className={`text-xl flex items-center ${feedback[currentQuestionIndex]?.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {feedback[currentQuestionIndex]?.isCorrect ? <CheckCircle className="mr-2 h-6 w-6" /> : <XCircle className="mr-2 h-6 w-6" />}
                      {feedback[currentQuestionIndex]?.isCorrect ? 'Correct!' : 'Incorrect.'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-1">
                    {!feedback[currentQuestionIndex]?.isCorrect && (
                      <p>Correct answer: <span className="font-semibold">{currentQuestion.options[currentQuestion.correctOptionIndex].text}</span></p>
                    )}
                    <p className="text-sm pt-1"><span className="font-semibold">Explanation:</span> {currentQuestion.explanation}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <div className="mt-8 flex justify-between">
            <Button onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0} variant="outline" size="lg">Previous</Button>
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <Button onClick={handleNextQuestion} size="lg" disabled={!isQuestionAnswered[currentQuestionIndex] && answers[currentQuestionIndex] === -1}>Next</Button>
            ) : (
              <Button onClick={handleSubmitQuiz} size="lg" variant="default" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={!isQuestionAnswered[currentQuestionIndex] && answers[currentQuestionIndex] === -1}>Submit Quiz</Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showResults} onOpenChange={setShowResults}>
        <AlertDialogContent className="max-w-2xl w-full">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Quiz Results</AlertDialogTitle>
            <AlertDialogDescription>
              You scored {score} out of {quiz.questions.length} questions correct.
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
                  {answers[index] !== q.correctOptionIndex && <p>Correct answer: <span className="font-semibold text-green-600">{q.options[q.correctOptionIndex].text}</span></p>}
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
            <Button onClick={() => { setShowResults(false); loadQuiz();}} className="w-full text-lg py-3">
                <RotateCcw className="mr-2 h-5 w-5" /> Close & Reset Date Picker
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

