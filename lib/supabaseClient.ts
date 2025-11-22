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
  // Log an explicit error so developers can fix their .env; avoid throwing to prevent uncaught exceptions in the browser
  // which previously caused the whole app to crash at module-evaluation time.
  // In Vite apps, ensure your env keys are prefixed with VITE_ and available in `import.meta.env`.
  // Example .env: VITE_SUPABASE_URL=https://xyz.supabase.co
  //              VITE_SUPABASE_ANON_KEY=public-anon-key
  // or (existing project): VITE_SUPABASE_KEY=public-anon-key
  // If you prefer a hard failure during development, replace console.error with `throw new Error(...)`.
  // eslint-disable-next-line no-console
  console.error(
    "Supabase URL and Anon Key are required environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey as string);
