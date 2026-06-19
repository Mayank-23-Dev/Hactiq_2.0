import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing from environment configuration.");
}

export let supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

export function createAuthenticatedSupabaseClient(token: string) {
  const client = createClient(supabaseUrl || "", supabaseAnonKey || "", {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  supabase = client;
  return client;
}

export function resetSupabaseClient() {
  supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
}

