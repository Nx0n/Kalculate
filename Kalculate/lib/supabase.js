import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ใช้ environment variable เพื่อไม่ต้อง hardcode URL หรือ anon key ในแอปมือถือ
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('กรุณาตั้งค่า EXPO_PUBLIC_SUPABASE_URL และ EXPO_PUBLIC_SUPABASE_ANON_KEY ก่อนใช้งาน Supabase');
}

// ใน React Native เราต้องใช้ AsyncStorage เพื่อให้ session ของ Supabase รักษาอยู่ระหว่างเปิดปิดแอป
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage: AsyncStorage,
  },
});
