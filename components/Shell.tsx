'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import type { Role } from '@/lib/types';
import { Badge, Button } from './ui';

export function Logo() {
  return (
    <span className="flex items-center gap-2 font-bold tracking-tight">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-sm text-white">Q</span>
      <span>
        Quizly<span className="text-brand">.</span>
      </span>
    </span>
  );
}

export function Shell({ role, children }: { role: Role; children: React.ReactNode }) {
  const { me, signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href={role === 'teacher' ? '/teacher' : '/student'}>
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight">{me?.displayName}</p>
              <p className="text-xs text-muted">{me?.email}</p>
            </div>
            <Badge tone={role === 'teacher' ? 'brand' : 'muted'}>{role === 'teacher' ? 'Teacher' : 'Student'}</Badge>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                router.replace('/login');
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">{children}</main>
    </div>
  );
}
