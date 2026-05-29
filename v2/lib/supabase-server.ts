import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-Role-Client: NUR serverseitig (umgeht RLS). Niemals an den Client geben.
let _client: SupabaseClient | null = null;

export function db(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) console.error("[v2/db] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen");
  _client = createClient(url || "http://localhost", key || "x", {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export const STATE_ID = "hfk";
export const SESSION_SECRET = process.env.SESSION_SECRET || "";
