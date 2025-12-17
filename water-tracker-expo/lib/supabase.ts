import { createClient } from '@supabase/supabase-js';

// Trim whitespace and remove quotes if present
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim().replace(/^["']|["']$/g, '');
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim().replace(/^["']|["']$/g, '');

// Debug: Log if env vars are missing (remove in production)
if (__DEV__) {
  console.log('Supabase URL loaded:', supabaseUrl ? 'Yes' : 'No');
  console.log('Supabase Key loaded:', supabaseAnonKey ? 'Yes' : 'No');
  if (supabaseUrl) {
    console.log('Supabase URL (first 30 chars):', supabaseUrl.substring(0, 30) + '...');
  }
}

if (!supabaseUrl) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_URL environment variable. ' +
    'Create a .env file in the project root with EXPO_PUBLIC_SUPABASE_URL=your_url'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
    'Create a .env file in the project root with EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key'
  );
}

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error(
    `Invalid EXPO_PUBLIC_SUPABASE_URL format. URL must start with http:// or https://. ` +
    `Received: ${supabaseUrl.substring(0, 50)}...`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = any; // You can generate types from Supabase CLI
