import { createClient } from '@supabase/supabase-js';

// Public anon key only. Every data operation goes through the NestJS API;
// Supabase is used here purely for sign-up, sign-in and session refresh.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
