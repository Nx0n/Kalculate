import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';
// service นี้รับผิดชอบข้อมูลโปรไฟล์และน้ำหนักของผู้ใช้ โดยใช้ Supabase Auth + PostgreSQL

function buildProfilePayload(profileData) {
  const allowedFields = [
    'display_name',
    'sex',
    'birth_date',
    'height_cm',
    'current_weight_kg',
    'activity_level',
    'goal',
    'weekly_weight_change_kg',
  ];

  const payload = {};
  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(profileData, field)) {
      payload[field] = profileData[field];
    }
  });

  return payload;
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`ไม่สามารถตรวจสอบสถานะเข้าสู่ระบบได้: ${error.message}`);
  }

  if (!user) {
    throw new Error('กรุณาเข้าสู่ระบบก่อน');
  }

  return user;
}

export async function signUp({ email, password, displayName }) {
  if (!email || !password) {
    throw new Error('อีเมลและรหัสผ่านจำเป็นต้องมีค่า');
  }
const redirectUrl = Linking.createURL("/");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
    emailRedirectTo: redirectUrl,
      data: {
        display_name: displayName || '',
      },
    },
  });

  if (error) {
    throw new Error(`สมัครสมาชิกไม่สำเร็จ: ${error.message}`);
  }

  return data;
}

export async function signIn({ email, password }) {
  if (!email || !password) {
    throw new Error('อีเมลและรหัสผ่านจำเป็นต้องมีค่า');
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(`เข้าสู่ระบบไม่สำเร็จ: ${error.message}`);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`ลงชื่อออกไม่สำเร็จ: ${error.message}`);
  }
}

export async function getMyProfile() {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูลโปรไฟล์ได้: ${error.message}`);
  }

  return data;
}

export async function updateMyProfile(profileData) {
  const user = await getCurrentUser();
  const payload = buildProfilePayload(profileData);

  if (Object.keys(payload).length === 0) {
    throw new Error('ไม่มีข้อมูลที่อนุญาตให้บันทึก');
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        ...payload,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) {
    throw new Error(`บันทึกข้อมูลโปรไฟล์ไม่สำเร็จ: ${error.message}`);
  }

  return data;
}

export async function addWeightLog({ weightKg, loggedAt }) {
  const user = await getCurrentUser();
  const weight = Number(weightKg);

  if (!Number.isFinite(weight) || weight <= 0) {
    throw new Error('น้ำหนักต้องเป็นตัวเลขที่มากกว่า 0');
  }

  const loggedDate = loggedAt || new Date().toISOString().slice(0, 10);

  const { error: weightError } = await supabase.from('weight_logs').upsert(
    {
      user_id: user.id,
      weight_kg: weight,
      logged_at: loggedDate,
    },
    { onConflict: 'user_id,logged_at' }
  );

  if (weightError) {
    throw new Error(`บันทึกน้ำหนักไม่สำเร็จ: ${weightError.message}`);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ current_weight_kg: weight })
    .eq('id', user.id);

  if (profileError) {
    throw new Error(`อัปเดตน้ำหนักในโปรไฟล์ไม่สำเร็จ: ${profileError.message}`);
  }

  return { weightKg: weight, loggedAt: loggedDate };
}

export async function getWeightHistory({ limit = 30 } = {}) {
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from('weight_logs')
    .select('weight_kg, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`ไม่สามารถดึงประวัติน้ำหนักได้: ${error.message}`);
  }

  return data || [];
}
