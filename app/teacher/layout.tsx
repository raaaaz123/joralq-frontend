'use client';
import { Shell } from '@/components/Shell';
import { Loading } from '@/components/ui';
import { useRequireRole } from '@/lib/auth';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireRole('teacher');
  if (!ready) return <Loading />;
  return <Shell role="teacher">{children}</Shell>;
}
