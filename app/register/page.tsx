'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard, Field } from '@/components/AuthCard';
import { Button, cx } from '@/components/ui';
import { homeFor, useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Role } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError('Use at least 8 characters for your password.');
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { role, display_name: name.trim() } },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (!data.session) {
      // Project requires email confirmation.
      setCheckEmail(true);
      setBusy(false);
      return;
    }
    const profile = await refresh();
    router.replace(profile ? homeFor(profile.role) : '/login');
  }

  if (checkEmail)
    return (
      <AuthCard title="Check your inbox" sub={`We sent a confirmation link to ${email}.`}>
        <p className="text-sm text-ink-soft">Open the link, then come back and log in.</p>
        <Link href="/login" className="mt-6 inline-block font-semibold text-brand hover:underline">Go to log in</Link>
      </AuthCard>
    );

  return (
    <AuthCard title="Create your account" sub="Pick your role. It decides which dashboard you get.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/5 p-1">
          {(['student', 'teacher'] as Role[]).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setRole(r)}
              className={cx(
                'rounded-lg py-2 text-sm font-semibold capitalize transition',
                role === r ? 'bg-card shadow-sm' : 'text-ink-soft hover:text-ink',
              )}
            >
              {r}
            </button>
          ))}
        </div>
        <Field label="Display name" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="rounded-lg bg-bad-soft px-3 py-2 text-sm text-bad">{error}</p>}
        <Button type="submit" loading={busy} className="w-full">Create {role} account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="font-semibold text-brand hover:underline">Log in</Link>
      </p>
    </AuthCard>
  );
}
