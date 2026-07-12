import { supabase } from '../lib/supabase';
import { calculateNutritionSummary } from './nutritionService';

// service นี้จัดการบันทึกมื้ออาหารและคำนวณสรุปโภชนาการรายวัน

function normalizeMealType(mealType) {
  const normalized = String(mealType).toLowerCase();
  const validTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (!validTypes.includes(normalized)) {
    throw new Error('ประเภทมื้ออาหารต้องเป็น breakfast, lunch, dinner หรือ snack');
  }

  return normalized;
}

function buildSnapshotFromServing(serving, quantity) {
  const numericQuantity = Number(quantity);
  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    throw new Error('ปริมาณต้องเป็นตัวเลขที่มากกว่า 0');
  }

  return {
    calories_kcal: Number((serving.calories_kcal * numericQuantity).toFixed(2)),
    protein_g: Number((serving.protein_g * numericQuantity).toFixed(2)),
    carbs_g: Number((serving.carbs_g * numericQuantity).toFixed(2)),
    fat_g: Number((serving.fat_g * numericQuantity).toFixed(2)),
    fiber_g: Number((serving.fiber_g * numericQuantity).toFixed(2)),
    sugar_g: Number((serving.sugar_g * numericQuantity).toFixed(2)),
    sodium_mg: Number((serving.sodium_mg * numericQuantity).toFixed(2)),
  };
}

export async function getCurrentUserId() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`ไม่สามารถตรวจสอบผู้ใช้ได้: ${error.message}`);
  }

  if (!user) {
    throw new Error('กรุณาเข้าสู่ระบบก่อน');
  }

  return user.id;
}

export async function getOrCreateMealLog({ mealDate, mealType }) {
  const userId = await getCurrentUserId();
  const normalizedMealType = normalizeMealType(mealType);

  const { data: existingMeal, error: fetchError } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('meal_date', mealDate)
    .eq('meal_type', normalizedMealType)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`ไม่สามารถค้นหามื้ออาหารได้: ${fetchError.message}`);
  }

  if (existingMeal) {
    return existingMeal;
  }

  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      meal_date: mealDate,
      meal_type: normalizedMealType,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`สร้างมื้ออาหารใหม่ไม่สำเร็จ: ${error.message}`);
  }

  return data;
}

export async function addMealItem({ mealDate, mealType, servingId, quantity = 1 }) {
  const normalizedMealType = normalizeMealType(mealType);

  const { data: serving, error: servingError } = await supabase
    .from('food_servings')
    .select('*, foods(*)')
    .eq('id', servingId)
    .maybeSingle();

  if (servingError) {
    throw new Error(`ไม่สามารถดึง serving ของอาหารได้: ${servingError.message}`);
  }

  if (!serving || !serving.foods) {
    throw new Error('ไม่พบข้อมูล serving ที่เลือก');
  }

  const mealLog = await getOrCreateMealLog({ mealDate, mealType: normalizedMealType });
  const snapshot = buildSnapshotFromServing(serving, quantity);

  const nutritionTotals = calculateNutritionSummary([
    {
      calories_kcal: snapshot.calories_kcal,
      protein_g: snapshot.protein_g,
      carbs_g: snapshot.carbs_g,
      fat_g: snapshot.fat_g,
      fiber_g: snapshot.fiber_g,
      sugar_g: snapshot.sugar_g,
      sodium_mg: snapshot.sodium_mg,
    },
  ]);

  const { data, error } = await supabase
    .from('meal_log_items')
    .insert({
      meal_log_id: mealLog.id,
      food_id: serving.food_id,
      serving_id: serving.id,
      food_name: serving.foods.name_th || serving.foods.name_en || 'อาหาร',
      serving_name: serving.serving_name,
      quantity: Number(quantity),
      grams: Number(serving.grams * quantity),
      calories_kcal: nutritionTotals.caloriesKcal,
      protein_g: nutritionTotals.proteinG,
      carbs_g: nutritionTotals.carbsG,
      fat_g: nutritionTotals.fatG,
      fiber_g: nutritionTotals.fiberG,
      sugar_g: nutritionTotals.sugarG,
      sodium_mg: nutritionTotals.sodiumMg,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`บันทึกอาหารในมื้อไม่สำเร็จ: ${error.message}`);
  }

  return data;
}

export async function updateMealItemQuantity({ itemId, quantity }) {
  if (!itemId) {
    throw new Error('รหัสรายการอาหารจำเป็นต้องมีค่า');
  }

  const numericQuantity = Number(quantity);
  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
    throw new Error('ปริมาณต้องเป็นตัวเลขที่มากกว่า 0');
  }

  const { data: item, error: fetchError } = await supabase
    .from('meal_log_items')
    .select('*')
    .eq('id', itemId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`ไม่สามารถค้นหารายการอาหารได้: ${fetchError.message}`);
  }

  if (!item) {
    throw new Error('ไม่พบรายการอาหารที่ต้องการแก้ไข');
  }

  // เก็บ snapshot nutrition ของรายการไว้ในตาราง meal_log_items เพื่อให้แสดงประวัติได้แม้จะมีการเปลี่ยนแปลงข้อมูลอาหารในอนาคต
  const { data: serving, error: servingError } = await supabase
    .from('food_servings')
    .select('*')
    .eq('id', item.serving_id)
    .maybeSingle();

  if (servingError) {
    throw new Error(`ไม่สามารถดึงข้อมูล serving ที่ใช้ล่าสุดได้: ${servingError.message}`);
  }

  if (!serving) {
    throw new Error('ไม่พบข้อมูล serving สำหรับรายการนี้');
  }

  const snapshot = buildSnapshotFromServing(serving, numericQuantity);
  const nutritionTotals = calculateNutritionSummary([
    {
      calories_kcal: snapshot.calories_kcal,
      protein_g: snapshot.protein_g,
      carbs_g: snapshot.carbs_g,
      fat_g: snapshot.fat_g,
      fiber_g: snapshot.fiber_g,
      sugar_g: snapshot.sugar_g,
      sodium_mg: snapshot.sodium_mg,
    },
  ]);

  const { data, error } = await supabase
    .from('meal_log_items')
    .update({
      quantity: numericQuantity,
      grams: Number(serving.grams * numericQuantity),
      calories_kcal: nutritionTotals.caloriesKcal,
      protein_g: nutritionTotals.proteinG,
      carbs_g: nutritionTotals.carbsG,
      fat_g: nutritionTotals.fatG,
      fiber_g: nutritionTotals.fiberG,
      sugar_g: nutritionTotals.sugarG,
      sodium_mg: nutritionTotals.sodiumMg,
    })
    .eq('id', itemId)
    .select()
    .single();

  if (error) {
    throw new Error(`อัปเดตปริมาณอาหารไม่สำเร็จ: ${error.message}`);
  }

  return data;
}

export async function deleteMealItem(itemId) {
  if (!itemId) {
    throw new Error('รหัสรายการอาหารจำเป็นต้องมีค่า');
  }

  const { error } = await supabase.from('meal_log_items').delete().eq('id', itemId);

  if (error) {
    throw new Error(`ลบรายการอาหารไม่สำเร็จ: ${error.message}`);
  }
}

export async function getMealsForDate(mealDate) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('id, meal_type, meal_date, meal_log_items(*)')
    .eq('user_id', userId)
    .eq('meal_date', mealDate)
    .order('meal_type', { ascending: true });

  if (error) {
    throw new Error(`ไม่สามารถดึงมื้ออาหารในวันที่เลือกได้: ${error.message}`);
  }

  const meals = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  (data || []).forEach((mealLog) => {
    meals[mealLog.meal_type] = mealLog.meal_log_items || [];
  });

  return meals;
}

export async function getDailyNutrition(mealDate) {
  const meals = await getMealsForDate(mealDate);
  const flattenedItems = Object.values(meals).flat();
  const totals = calculateNutritionSummary(flattenedItems);

  return {
    date: mealDate,
    meals,
    totals,
  };
}

export async function getNutritionHistory({ startDate, endDate }) {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('meal_logs')
    .select('meal_date, meal_log_items(*)')
    .eq('user_id', userId)
    .gte('meal_date', startDate)
    .lte('meal_date', endDate)
    .order('meal_date', { ascending: true });

  if (error) {
    throw new Error(`ไม่สามารถดึงประวัติโภชนาการได้: ${error.message}`);
  }

  // รวมรายการอาหารจากทุก meal_log ในวันเดียวกันให้กลายเป็นยอดรวมทั้งวันเดียว
  const groupedByDate = new Map();

  (data || []).forEach((mealLog) => {
    const date = mealLog.meal_date;
    const items = mealLog.meal_log_items || [];

    if (!groupedByDate.has(date)) {
      groupedByDate.set(date, []);
    }

    groupedByDate.get(date).push(...items);
  });

  return Array.from(groupedByDate.entries())
    .map(([date, items]) => ({
      date,
      totals: calculateNutritionSummary(items),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
