'use client';
import { useParams } from 'next/navigation';
import { LeaderboardView } from '@/components/LeaderboardView';

export default function StudentLeaderboard() {
  const { id } = useParams<{ id: string }>();
  return <LeaderboardView quizId={id} back={{ href: '/student', label: 'My quizzes' }} />;
}
