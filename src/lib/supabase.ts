import { createClient } from "@supabase/supabase-js";
import { auth } from "./firebase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing from environment configuration.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  accessToken: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  }
});

