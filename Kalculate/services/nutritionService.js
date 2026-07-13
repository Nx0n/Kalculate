// ฟังก์ชันคำนวณโภชนาการนี้เป็น pure functions เพื่อให้หน้า UI เรียกใช้ได้ง่ายและทดสอบง่าย

function ensureNumber(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    throw new Error(`${fieldName} จำเป็นต้องมีค่า`);
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    throw new Error(`${fieldName} ต้องเป็นตัวเลข`);
  }

  return numericValue;
}

export function calculateAge(birthDate) {
  if (!birthDate) {
    throw new Error('วันเกิดจำเป็นต้องมีค่า');
  }

  const parsedDate = new Date(birthDate);
  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error('วันเกิดไม่ถูกต้อง');
  }

  const today = new Date();
  let age = today.getFullYear() - parsedDate.getFullYear();
  const hasBirthdayPassed =
    today.getMonth() < parsedDate.getMonth() ||
    (today.getMonth() === parsedDate.getMonth() && today.getDate() < parsedDate.getDate());

  if (hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

export function calculateBmi({ weightKg, heightCm }) {
  const weight = ensureNumber(weightKg, 'น้ำหนัก');
  const height = ensureNumber(heightCm, 'ส่วนสูง');

  if (height <= 0) {
    throw new Error('ส่วนสูงต้องมากกว่า 0');
  }

  if (weight <= 0) {
    throw new Error('น้ำหนักต้องมากกว่า 0');
  }

  // BMI = น้ำหนัก (kg) / ส่วนสูง (m) ^ 2
  return Number((weight / ((height / 100) ** 2)).toFixed(1));
}

export function getBmiCategory(bmi) {
  const value = ensureNumber(bmi, 'ค่า BMI');

  if (value < 18.5) {
    return 'ผอม';
  }

  if (value < 25) {
    return 'ปกติ';
  }

  if (value < 30) {
    return 'น้ำหนักเกิน';
  }

  return 'อ้วน';
}

export function calculateBmr({ sex, age, weightKg, heightCm }) {
  const parsedAge = ensureNumber(age, 'อายุ');
  const weight = ensureNumber(weightKg, 'น้ำหนัก');
  const height = ensureNumber(heightCm, 'ส่วนสูง');

  if (parsedAge <= 0) {
    throw new Error('อายุต้องมากกว่า 0');
  }

  if (weight <= 0 || height <= 0) {
    throw new Error('น้ำหนักและส่วนสูงต้องมากกว่า 0');
  }

  const normalizedSex = String(sex).toLowerCase();
  // สูตร Mifflin-St Jeor
  if (normalizedSex === 'male') {
    return Number((10 * weight + 6.25 * height - 5 * parsedAge + 5).toFixed(0));
  }

  if (normalizedSex === 'female') {
    return Number((10 * weight + 6.25 * height - 5 * parsedAge - 161).toFixed(0));
  }

  throw new Error('เพศต้องเป็น male หรือ female');
}

export function getActivityMultiplier(activityLevel) {
  const normalizedLevel = String(activityLevel).toLowerCase();

  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  if (!multipliers[normalizedLevel]) {
    throw new Error('ระดับกิจกรรมไม่ถูกต้อง');
  }

  return multipliers[normalizedLevel];
}

export function calculateTdee(bmr, activityLevel) {
  const baseBmr = ensureNumber(bmr, 'BMR');
  const multiplier = getActivityMultiplier(activityLevel);

  // TDEE = BMR × multiplier ตามระดับกิจกรรม
  return Number((baseBmr * multiplier).toFixed(0));
}

export function calculateTargetCalories(tdee, goal, weeklyWeightChangeKg, sex) {
  const baseTdee = ensureNumber(tdee, 'TDEE');
  const normalizedGoal = String(goal).toLowerCase();
  const normalizedSex = String(sex).toLowerCase();

  // ค่าปรับค่าแบบปลอดภัย: 1 กิโลกรัมต่อสัปดาห์ ~= 7700 kcal ต่อสัปดาห์ => ~1100 kcal ต่อวัน
  const weeklyChange = Number(weeklyWeightChangeKg || 0);
  const dailyAdjustment = weeklyChange * 1100;

  let targetCalories = baseTdee;

  if (normalizedGoal === 'lose_weight') {
    targetCalories = baseTdee - dailyAdjustment;
  } else if (normalizedGoal === 'gain_weight') {
    targetCalories = baseTdee + dailyAdjustment;
  } else if (normalizedGoal !== 'maintain') {
    throw new Error('เป้าหมายต้องเป็น lose_weight, maintain หรือ gain_weight');
  }

  const minimumCalories = normalizedSex === 'female' ? 1200 : 1500;
  if (targetCalories < minimumCalories) {
    targetCalories = minimumCalories;
  }

  return Number(targetCalories.toFixed(0));
}

export function calculateMacroTargets(targetCalories) {
  const calories = ensureNumber(targetCalories, 'แคลอรี่เป้าหมาย');

  // ค่าเริ่มต้นของ macro: โปรตีน 30%, คาร์โบ 40%, ไขมัน 30%
  const proteinCalories = calories * 0.3;
  const carbsCalories = calories * 0.4;
  const fatCalories = calories * 0.3;

  return {
    proteinG: Number((proteinCalories / 4).toFixed(0)),
    carbsG: Number((carbsCalories / 4).toFixed(0)),
    fatG: Number((fatCalories / 9).toFixed(0)),
  };
}

export function calculateNutritionSummary(items) {
  if (!Array.isArray(items)) {
    throw new Error('รายการอาหารต้องเป็น array');
  }

  const totals = {
    caloriesKcal: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    fiberG: 0,
    sugarG: 0,
    sodiumMg: 0,
  };

  items.forEach((item) => {
    totals.caloriesKcal += ensureNumber(item.calories_kcal ?? item.caloriesKcal ?? 0, 'แคลอรี่');
    totals.proteinG += ensureNumber(item.protein_g ?? item.proteinG ?? 0, 'โปรตีน');
    totals.carbsG += ensureNumber(item.carbs_g ?? item.carbsG ?? 0, 'คาร์โบไฮเดรต');
    totals.fatG += ensureNumber(item.fat_g ?? item.fatG ?? 0, 'ไขมัน');
    totals.fiberG += ensureNumber(item.fiber_g ?? item.fiberG ?? 0, 'ไฟเบอร์');
    totals.sugarG += ensureNumber(item.sugar_g ?? item.sugarG ?? 0, 'น้ำตาล');
    totals.sodiumMg += ensureNumber(item.sodium_mg ?? item.sodiumMg ?? 0, 'โซเดียม');
  });

  return {
    caloriesKcal: Number(totals.caloriesKcal.toFixed(2)),
    proteinG: Number(totals.proteinG.toFixed(2)),
    carbsG: Number(totals.carbsG.toFixed(2)),
    fatG: Number(totals.fatG.toFixed(2)),
    fiberG: Number(totals.fiberG.toFixed(2)),
    sugarG: Number(totals.sugarG.toFixed(2)),
    sodiumMg: Number(totals.sodiumMg.toFixed(2)),
  };
}

export function formatNumber(value, fractionDigits = 0) {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue = ensureNumber(value, 'ค่า');
  return Number(numericValue.toFixed(fractionDigits));
}
