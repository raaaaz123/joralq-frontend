'use client';
import { useParams } from 'next/navigation';
import { LeaderboardView } from '@/components/LeaderboardView';

export default function TeacherLeaderboard() {
  const { id } = useParams<{ id: string }>();
  return <LeaderboardView quizId={id} back={{ href: `/teacher/quizzes/${id}`, label: 'Quiz analytics' }} />;
}
