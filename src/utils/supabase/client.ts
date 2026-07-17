import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log("pomoBEAK client variables check:", {
    url: url ? "LOADED" : "MISSING",
    key: key ? "LOADED" : "MISSING"
  });
  return createBrowserClient(
    url!,
    key!
  )
}
