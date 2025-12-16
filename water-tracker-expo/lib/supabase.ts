import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use AsyncStorage for web, SecureStore for native
const authStorage =
  Platform.OS === 'web'
    ? {
        getItem: (key: string) => {
          if (typeof window === 'undefined') {
            return Promise.resolve(null);
          }
          return Promise.resolve(window.localStorage?.getItem(key));
        },
        setItem: (key: string, value: string) => {
          if (typeof window === 'undefined') {
            return Promise.resolve();
          }
          window.localStorage?.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') {
            return Promise.resolve();
          }
          window.localStorage?.removeItem(key);
          return Promise.resolve();
        },
      }
    : {
        getItem: SecureStore.getItemAsync,
        setItem: SecureStore.setItemAsync,
        removeItem: SecureStore.deleteItemAsync,
      };

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = any; // You can generate types from Supabase CLI
