// ฟังก์ชันคำนวณโภชนาการที่เน้นด้านสุขภาพและสอดคล้องกับ BMI

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

  return Number((weight / ((height / 100) ** 2)).toFixed(1));
}

export function getBmiCategory(bmi) {
  const value = ensureNumber(bmi, 'ค่า BMI');

  if (value < 18.5) {
    return 'น้ำหนักน้อย (ผอม)';
  }

  if (value < 23) {
    return 'ปกติ (สุขภาพดี)';
  }

  if (value < 25) {
    return 'น้ำหนักเกิน (ท้วม)';
  }

  if (value < 30) {
    return 'อ้วนระดับ 1';
  }

  return 'อ้วนระดับ 2';
}

export function calculateBmr({ sex, age, weightKg, heightCm }) {
  const parsedAge = ensureNumber(age, 'อายุ');
  const weight = ensureNumber(weightKg, 'น้ำหนัก');
  const height = ensureNumber(heightCm, 'ส่วนสูง');

  const normalizedSex = String(sex).toLowerCase();
  if (normalizedSex === 'male') {
    return Number((10 * weight + 6.25 * height - 5 * parsedAge + 5).toFixed(0));
  }
  if (normalizedSex === 'female') {
    return Number((10 * weight + 6.25 * height - 5 * parsedAge - 161).toFixed(0));
  }
  return Number((10 * weight + 6.25 * height - 5 * parsedAge - 78).toFixed(0)); // Average for unspecified
}

export function getActivityMultiplier(activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return multipliers[activityLevel] || 1.2;
}

export function calculateTdee(bmr, activityLevel) {
  const baseBmr = ensureNumber(bmr, 'BMR');
  const multiplier = getActivityMultiplier(activityLevel);
  return Number((baseBmr * multiplier).toFixed(0));
}

/**
 * คำนวณแคลอรี่เป้าหมายที่สอดคล้องกับ BMI เพื่อสุขภาพที่ดี
 */
export function calculateSmartTargetCalories({ bmi, tdee, sex, goalPreference = 'health' }) {
  const baseTdee = ensureNumber(tdee, 'TDEE');
  const currentBmi = ensureNumber(bmi, 'BMI');
  const normalizedSex = String(sex).toLowerCase();

  let adjustment = 0;
  let recommendation = '';

  // ตรรกะการปรับแคลอรี่ตาม BMI เพื่อสุขภาพ (Health-first approach)
  if (currentBmi < 18.5) {
    // ผอมเกินไป: แนะนำให้เพิ่มแคลอรี่เพื่อสร้างมวลกล้ามเนื้อและน้ำหนักที่สุขภาพดี
    adjustment = 300;
    recommendation = 'เพิ่มสารอาหารเพื่อน้ำหนักที่เหมาะสม';
  } else if (currentBmi >= 23 && currentBmi < 25) {
    // เริ่มท้วม: ปรับลดเล็กน้อยเพื่อรักษาสุขภาพและป้องกันการอ้วน
    adjustment = -200;
    recommendation = 'ควบคุมพลังงานเพื่อสุขภาพที่ดีขึ้น';
  } else if (currentBmi >= 25 && currentBmi < 30) {
    // อ้วนระดับ 1: ลดแคลอรี่แบบปลอดภัย (Deficit)
    adjustment = -400;
    recommendation = 'เน้นลดไขมันส่วนเกินอย่างยั่งยืน';
  } else if (currentBmi >= 30) {
    // อ้วนระดับ 2: ลดแคลอรี่เพื่อลดความเสี่ยงโรค
    adjustment = -500;
    recommendation = 'ลดพลังงานเพื่อลดความเสี่ยงด้านสุขภาพ';
  } else {
    // น้ำหนักปกติ: เน้นคงที่เพื่อรักษาสุขภาพ
    adjustment = 0;
    recommendation = 'รักษาพลังงานให้คงที่เพื่อสุขภาพที่ดี';
  }

  let target = baseTdee + adjustment;

  // ป้องกันไม่ให้ต่ำกว่าค่าพลังงานขั้นพื้นฐานที่ปลอดภัย
  const minSafe = normalizedSex === 'female' ? 1200 : 1500;
  if (target < minSafe) target = minSafe;

  return {
    targetCalories: Math.round(target),
    recommendation,
    adjustment
  };
}

/**
 * คำนวณสัดส่วนสารอาหาร (Macros) ตามเป้าหมายสุขภาพ
 * เน้นโปรตีนสูงขึ้นสำหรับคนต้องการลดไขมัน หรือคนต้องการสร้างกล้ามเนื้อ
 */
export function calculateHealthMacroTargets(targetCalories, bmi) {
  const calories = ensureNumber(targetCalories, 'แคลอรี่');

  let proteinRatio = 0.25;
  let carbRatio = 0.45;
  let fatRatio = 0.30;

  if (bmi >= 25) {
    // สำหรับคนน้ำหนักเกิน เน้นโปรตีนเพื่อให้อิ่มนานและรักษาการเผาผลาญ
    proteinRatio = 0.35;
    carbRatio = 0.35;
    fatRatio = 0.30;
  } else if (bmi < 18.5) {
    // สำหรับคนผอม เน้นคาร์โบไฮเดรตเชิงซ้อนและโปรตีน
    proteinRatio = 0.25;
    carbRatio = 0.50;
    fatRatio = 0.25;
  }

  return {
    proteinG: Math.round((calories * proteinRatio) / 4),
    carbsG: Math.round((calories * carbRatio) / 4),
    fatG: Math.round((calories * fatRatio) / 9),
    ratios: { proteinRatio, carbRatio, fatRatio }
  };
}

export function calculateNutritionSummary(items) {
  const totals = {
    caloriesKcal: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
  };

  items.forEach((item) => {
    totals.caloriesKcal += Number(item.calories_kcal ?? item.caloriesKcal ?? 0);
    totals.proteinG += Number(item.protein_g ?? item.proteinG ?? 0);
    totals.carbsG += Number(item.carbs_g ?? item.carbsG ?? 0);
    totals.fatG += Number(item.fat_g ?? item.fatG ?? 0);
  });

  return {
    caloriesKcal: Math.round(totals.caloriesKcal),
    proteinG: Math.round(totals.proteinG),
    carbsG: Math.round(totals.carbsG),
    fatG: Math.round(totals.fatG),
  };
}
