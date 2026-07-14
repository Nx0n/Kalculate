import { supabase } from '../lib/supabase';

// service นี้จัดการข้อมูลอาหารและ serving ที่ใช้ในแอป โดยอ่านจาก Supabase

function escapeLikePattern(value) {
  return String(value).trim().replace(/[%_]/g, '\\$&');
}

export async function searchFoods(query, { limit = 30 } = {}) {
  if (typeof query !== 'string' || query.trim() === '') {
    return [];
  }

  const safeQuery = escapeLikePattern(query.trim());
  const searchPattern = `%${safeQuery}%`;

  const { data, error } = await supabase
    .from('foods')
    .select('id, name_th, name_en, brand_name, category, barcode, image_url, source_name, is_verified, is_active')
    .eq('is_active', true)
    .or(`name_th.ilike.${searchPattern},name_en.ilike.${searchPattern},brand_name.ilike.${searchPattern}`)
    .order('is_verified', { ascending: false })
    .order('name_th', { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`ไม่สามารถค้นหาข้อมูลอาหารได้: ${error.message}`);
  }

  return data || [];
}

export async function getFoodByBarcode(barcode) {
  if (!barcode || typeof barcode !== 'string' || barcode.trim() === '') {
    throw new Error('บาร์โค้ดจำเป็นต้องมีค่า');
  }

  const { data, error } = await supabase
    .from('foods')
    .select('*')
    .eq('barcode', barcode.trim())
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw new Error(`ไม่สามารถค้นหาอาหารตามบาร์โค้ดได้: ${error.message}`);
  }

  return data;
}

export async function getFoodWithServings(foodId) {
  if (!foodId) {
    throw new Error('รหัสอาหารจำเป็นต้องมีค่า');
  }

  const { data: food, error: foodError } = await supabase
    .from('foods')
    .select('*')
    .eq('id', foodId)
    .eq('is_active', true)
    .maybeSingle();

  if (foodError) {
    throw new Error(`ไม่สามารถดึงข้อมูลอาหารได้: ${foodError.message}`);
  }

  if (!food) {
    return null;
  }

  const { data: servings, error: servingError } = await supabase
    .from('food_servings')
    .select('*')
    .eq('food_id', foodId)
    .order('grams', { ascending: true });

  if (servingError) {
    throw new Error(`ไม่สามารถดึง serving ของอาหารได้: ${servingError.message}`);
  }

  return {
    ...food,
    servings: servings || [],
  };
}

export async function getFoodServing(servingId) {
  if (!servingId) {
    throw new Error('รหัส serving จำเป็นต้องมีค่า');
  }

  const { data, error } = await supabase
    .from('food_servings')
    .select('*')
    .eq('id', servingId)
    .maybeSingle();

  if (error) {
    throw new Error(`ไม่สามารถดึงข้อมูล serving ได้: ${error.message}`);
  }

  return data;
}
