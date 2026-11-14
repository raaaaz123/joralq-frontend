'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthCard, Field } from '@/components/AuthCard';
import { Button } from '@/components/ui';
import { homeFor, useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const { me, loading, refresh } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && me) router.replace(homeFor(me.role));
  }, [loading, me, router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
      setBusy(false);
      return;
    }
    const profile = await refresh();
    if (!profile) {
      setError('Signed in, but your profile could not be loaded. Please try again.');
      setBusy(false);
      return;
    }
    router.replace(homeFor(profile.role));
  }

  const demo = (who: 'teacher' | 'student') => {
    setEmail(`${who}@demo.jora`);
    setPassword('Demo@1234');
  };

  return (
    <AuthCard title="Welcome back" sub="Log in to your teacher or student account.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}
        <Button type="submit" loading={busy} className="w-full">Log in</Button>
      </form>
      <div className="mt-6 rounded-xl border border-dashed border-line p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">Demo accounts</p>
        <div className="mt-3 flex gap-2">
          <Button type="button" variant="outline" className="flex-1" onClick={() => demo('teacher')}>Teacher</Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => demo('student')}>Student</Button>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-ink-soft">
        New here? <Link href="/register" className="font-semibold text-brand hover:underline">Create an account</Link>
      </p>
    </AuthCard>
  );
}
