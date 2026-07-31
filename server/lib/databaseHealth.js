import { createClient } from '@supabase/supabase-js';

const HEALTH_QUERIES = [
  { table: 'developers', column: 'wallet_address' },
  { table: 'apis', column: 'id' },
  { table: 'payments', column: 'id' },
];

export function createDatabaseHealthClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) return null;

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function checkDatabaseHealth(client = createDatabaseHealthClient()) {
  if (!client) {
    throw new Error('Database health check is not configured');
  }

  for (const query of HEALTH_QUERIES) {
    const { error } = await client
      .from(query.table)
      .select(query.column, { head: true })
      .limit(1);

    if (error) throw error;
  }

  return { queryCount: HEALTH_QUERIES.length };
}
