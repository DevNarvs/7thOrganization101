import { createClient } from "@supabase/supabase-js";

// Prefer Vite's `import.meta.env` in the browser, fall back to `process.env` for Node/tooling
const getEnv = (key: string) => {
  try {
    // @ts-ignore - import.meta may not be defined in some environments
    return (
      (typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env[key]) ||
      (process && (process.env as any)[key])
    );
  } catch {
    return (process && (process.env as any)[key]) || undefined;
  }
};

const supabaseUrl = getEnv("VITE_SUPABASE_URL") || "";
// Support both `VITE_SUPABASE_ANON_KEY` (explicit) and `VITE_SUPABASE_KEY` (existing env in repo)
const supabaseAnonKey =
  getEnv("VITE_SUPABASE_ANON_KEY") || getEnv("VITE_SUPABASE_KEY") || "";

if (!supabaseUrl || !supabaseAnonKey) {
  const msg =
    "Supabase URL and Anon Key are required environment variables.\nPlease set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_KEY) in your .env file.\nExample:\nVITE_SUPABASE_URL=https://xyz.supabase.co\nVITE_SUPABASE_KEY=public-anon-key";

  // Fail loudly in development so misconfiguration is obvious (prevents 400s from downstream requests).
  // In production you may prefer to log and fail more gracefully.
  // eslint-disable-next-line no-console
  console.error(msg);
  // Throw to stop execution and give a clear stack trace in dev.
  throw new Error(msg);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey as string);

// Export a helper so other modules can check config without causing exceptions
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
