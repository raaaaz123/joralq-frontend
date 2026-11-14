'use client';
import { Shell } from '@/components/Shell';
import { Loading } from '@/components/ui';
import { useRequireRole } from '@/lib/auth';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireRole('student');
  if (!ready) return <Loading />;
  return <Shell role="student">{children}</Shell>;
}
