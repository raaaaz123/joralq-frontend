'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ErrorState, Loading } from '@/components/ui';
import { homeFor, useAuth } from '@/lib/auth';

/** Role-based entry point. */
export default function Home() {
  const { me, loading, session, error, refresh } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    if (me) router.replace(homeFor(me.role));
    else if (!session) router.replace('/login');
  }, [loading, me, session, router]);
  if (session && !me && !loading && error)
    return <div className="mx-auto max-w-md p-8"><ErrorState error={error} onRetry={refresh} /></div>;
  return <Loading />;
}
