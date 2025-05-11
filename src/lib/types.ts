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

export interface UserScoreData {
  score: number;
  // Potentially add history of quizzes taken, scores, etc.
  // quizAttempts: Array<{ quizId: string, score: number, date: string, answers: number[] }>;
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
