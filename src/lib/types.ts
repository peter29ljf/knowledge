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
  quiz_id: string;
  score: number; // Score for this specific quiz attempt (e.g., number of correct answers)
  total_questions: number; // Total number of questions in the quiz
  answers: number[]; // User's selected option indices for each question
  timestamp: number; // When the quiz was completed
  points_earned: number; // Points earned for this attempt
}

export interface ScoreHistoryEntry {
  date: string;
  points: number;
  reason: string;
}

export interface Achievement {
  id: string;
  name: string;
  achieved_at: string;
}

export interface UserScoreData {
  score: number; // Cumulative global score
  history?: ScoreHistoryEntry[]; // History of score changes
  achievements?: Achievement[]; // User achievements
  last_updated?: string; // ISO date string
  quizAttempts?: Record<string, QuizAttempt>; // Keyed by quizDate (YYYY-MM-DD)
}

export interface AdminMessage { // User to Admin
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
  response?: string | null;
  response_timestamp?: number | null;
  isRead?: boolean;
}

// Represents the overall structure of data managed by admin
export interface AppContent {
  learningMaterials: LearningMaterial[];
  quizzes: Quiz[];
  announcements: Announcement[];
}

// User announcement read status
export interface AnnouncementStatus {
  read_announcements: string[];
  last_viewed: string;
}

