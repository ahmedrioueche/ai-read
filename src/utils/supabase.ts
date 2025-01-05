import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or API key is not defined");
}

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

export default supabase;

// Attach JWT token once the user is authenticated
export const setupSupabaseClient = (token: string): SupabaseClient => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL or API key is not defined");
  }

  // Create a new client with the JWT token in headers
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
