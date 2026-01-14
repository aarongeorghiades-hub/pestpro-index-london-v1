import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ertsaqajwyoywxgkgfjq.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVydHNhcWFqd3lveXd4Z2tnZmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzI0MjAsImV4cCI6MjA4MDk0ODQyMH0.be4LKgbL8N0dnHPgoU5n6AFgSf2OwLWeN8fTsTZOM4I';

export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseKey);
};
