export type Role = 'teacher' | 'student';
export interface Me { id: string; email: string; displayName: string; role: Role }
export interface Student { id: string; displayName: string; email: string }

export interface Option { id: string; label: string; isCorrect?: boolean }
export interface Question { id: string; position: number; prompt: string; options: Option[] }
export interface QuizDetail {
  id: string; title: string; description: string; createdAt: string;
  questionCount: number; questions: Question[]; status?: 'pending' | 'completed';
}
export interface TeacherQuiz {
  id: string; title: string; description: string; createdAt: string;
  questionCount: number; assignedCount: number; completedCount: number; averageAccuracy: number | null;
}
export interface Analytics {
  quiz: { id: string; title: string; description: string; questionCount: number };
  assignedCount: number; completedCount: number; pendingCount: number; averageAccuracy: number | null;
  students: {
    studentId: string; displayName: string; email: string; assignedAt: string;
    status: 'pending' | 'completed'; correctAnswers: number | null; totalQuestions: number;
    accuracy: number | null; submittedAt: string | null;
  }[];
}
export interface Assignment {
  quizId: string; title: string; description: string; teacherName: string; assignedAt: string;
  questionCount: number; status: 'pending' | 'completed';
  result: { correctAnswers: number; totalQuestions: number; accuracy: number; submittedAt: string } | null;
}
export interface Result {
  quizId: string; title: string; status: 'completed'; totalQuestions: number; correctAnswers: number;
  incorrectAnswers: number; accuracy: number; submittedAt: string;
  review: { questionId: string; prompt: string; selectedOptionId: string | null; isCorrect: boolean; options: Option[] }[];
}
export interface LeaderboardEntry {
  rank: number; displayName: string; correctAnswers: number; totalQuestions: number;
  accuracy: number; submittedAt: string; isCurrentUser: boolean;
}
export interface Leaderboard {
  quiz: { id: string; title: string }; assignedCount: number; participantCount: number;
  me: LeaderboardEntry | null; entries: LeaderboardEntry[];
}
