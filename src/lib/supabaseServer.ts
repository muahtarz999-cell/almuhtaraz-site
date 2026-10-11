import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  // Warn during local build or initial configuration
  console.warn('Supabase URL or SERVICE_ROLE_KEY is missing from environment variables.');
}

/**
 * Server-only Supabase client using the SERVICE_ROLE_KEY.
 * Bypasses RLS to perform system tasks, webhook processing, and privileged actions.
 * NOTE: Always validate client_id manually in your API logic!
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
