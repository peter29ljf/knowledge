export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string; // Added for display
}

export interface LearningMaterial {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  content: string; // Markdown or HTML
}

export interface QuizQuestionOption {
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizQuestionOption[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id:string;
  date: string; // YYYY-MM-DD
  title: string;
  questions: QuizQuestion[];
}

export interface Announcement {
  id: string;
  date: string; // YYYY-MM-DD
  message: string;
  publishedAt: number; // Timestamp
}

export interface QuizAttempt {
  quizDate: string; // YYYY-MM-DD, unique identifier for the daily quiz
  score: number; // Score for this specific quiz attempt (e.g., number of correct answers)
  answers: number[]; // User's selected option indices for each question
  timestamp: number; // When the quiz was completed
}

export interface UserScoreData {
  score: number; // Cumulative global score
  quizAttempts?: Record<string, QuizAttempt>; // Keyed by quizDate (YYYY-MM-DD)
}

export interface AdminMessage { // User to Admin
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  isRead?: boolean;
}

// Represents the overall structure of data managed by admin
export interface AppContent {
  learningMaterials: LearningMaterial[];
  quizzes: Quiz[];
  announcements: Announcement[];
}

