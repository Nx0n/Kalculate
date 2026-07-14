#!/usr/bin/env node

// สคริปต์นี้แปลงไฟล์ USDA Foundation Foods จากหลาย CSV ให้กลายเป็นไฟล์ CSV ที่พร้อม import เข้า Supabase schema ของ Kalculate
// ในขั้นตอนนี้จะสร้างไฟล์ output เท่านั้น ไม่เชื่อมต่อ Supabase หรือ import ข้อมูลใด ๆ

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const inputDir = path.join(projectRoot, 'data', 'usda-foundation');
const outputDir = path.join(projectRoot, 'data', 'output');

const foodCsvPath = path.join(inputDir, 'food.csv');
const foundationFoodCsvPath = path.join(inputDir, 'foundation_food.csv');
const foodNutrientCsvPath = path.join(inputDir, 'food_nutrient.csv');
const nutrientCsvPath = path.join(inputDir, 'nutrient.csv');
const foodPortionCsvPath = path.join(inputDir, 'food_portion.csv');
const foodCategoryCsvPath = path.join(inputDir, 'food_category.csv');

const outputFoodsCsvPath = path.join(outputDir, 'usda_foods.csv');
const outputServingsCsvPath = path.join(outputDir, 'usda_food_servings.csv');

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field);
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }

      if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      }
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function readCsvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(content);

  if (rows.length === 0) {
    return [];
  }

  const [header, ...dataRows] = rows;
  return dataRows.map((row) => {
    const item = {};
    header.forEach((key, index) => {
      item[key] = row[index] || '';
    });
    return item;
  });
}

function formatNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return '';
  }

  return numericValue.toFixed(2);
}

function sanitizeText(value) {
  return (value || '').trim();
}

function buildCsvContent(rows, headers) {
  const lines = [];
  lines.push(headers.join(','));

  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] ?? '';
      const normalizedValue = String(value).replace(/"/g, '""');
      return normalizedValue.includes(',') || normalizedValue.includes('"') || normalizedValue.includes('\n')
        ? `"${normalizedValue}"`
        : normalizedValue;
    });
    lines.push(values.join(','));
  });

  return `${lines.join('\n')}\n`;
}

function normalizeCategoryName(categoryId, categoryMap) {
  if (!categoryId) {
    return '';
  }

  return categoryMap[categoryId] || '';
}

function buildNutrientLookup(nutrients) {
  const lookup = {};

  nutrients.forEach((nutrient) => {
    const nutrientId = sanitizeText(nutrient.id);

    if (!nutrientId) {
      return;
    }

    lookup[nutrientId] = nutrient;
  });

  return lookup;
}

function buildFoodNutrientMap(foodNutrients) {
  // สร้าง Map ที่ key คือ fdc_id เพื่อให้การค้นหาสารอาหารของอาหารแต่ละรายการเร็วขึ้นและไม่ต้อง filter ซ้ำ ๆ
  const map = new Map();

  foodNutrients.forEach((item) => {
    const fdcId = sanitizeText(item.fdc_id);
    if (!fdcId) {
      return;
    }

    if (!map.has(fdcId)) {
      map.set(fdcId, []);
    }

    map.get(fdcId).push(item);
  });

  return map;
}

function getNutrientAmountById(foodNutrientsForFood, nutrientId) {
  const nutrientEntry = foodNutrientsForFood.find((item) => sanitizeText(item.nutrient_id) === nutrientId);
  return nutrientEntry ? sanitizeText(nutrientEntry.amount) : '';
}

function shouldIncludeFood(foodRecord) {
  const description = sanitizeText(foodRecord.description);
  return description.length > 0;
}

// อ่านไฟล์ input ที่จำเป็นและไฟล์ optional ที่อาจมีอยู่
const foods = readCsvFile(foodCsvPath);
const foundationFoods = readCsvFile(foundationFoodCsvPath);
const foodNutrients = readCsvFile(foodNutrientCsvPath);
const nutrients = readCsvFile(nutrientCsvPath);
const foodPortions = readCsvFile(foodPortionCsvPath);
const foodCategories = readCsvFile(foodCategoryCsvPath);

const categoryMap = {};
foodCategories.forEach((category) => {
  categoryMap[sanitizeText(category.id)] = sanitizeText(category.description);
});

// เลือกเฉพาะ fdc_id ที่ปรากฏใน foundation_food.csv เพื่อให้ตรงกับ USDA Foundation Foods ที่เราต้องการ
const foundationFoodIds = new Set(
  foundationFoods
    .map((item) => sanitizeText(item.fdc_id))
    .filter(Boolean)
);

const nutrientLookup = buildNutrientLookup(nutrients);
const foodNutrientMap = buildFoodNutrientMap(foodNutrients);

const foodsOutput = [];
const servingsOutput = [];
let skippedCount = 0;
let passedCount = 0;
let selectedFoundationFoodCount = 0;

// สำหรับแต่ละอาหารใน food.csv เราจะผูกข้อมูลจาก food_nutrient.csv และ nutrient.csv
foods.forEach((foodRecord) => {
  if (!shouldIncludeFood(foodRecord)) {
    skippedCount += 1;
    return;
  }

  const fdcId = sanitizeText(foodRecord.fdc_id);
  if (!foundationFoodIds.has(fdcId)) {
    return;
  }

  selectedFoundationFoodCount += 1;
  const foodNutrientsForFood = foodNutrientMap.get(fdcId) || [];

  // ใช้ nutrient_id โดยตรงเพื่อให้ตรงกับ USDA Foundation Foods ที่ต้องการ
  const caloriesValue = getNutrientAmountById(foodNutrientsForFood, '1008');
  const proteinValue = getNutrientAmountById(foodNutrientsForFood, '1003');
  const fatValue = getNutrientAmountById(foodNutrientsForFood, '1004');
  const carbsValue = getNutrientAmountById(foodNutrientsForFood, '1005');

  // ถ้าไม่มี calories, protein, fat หรือ carbs จริง ๆ ให้ข้ามรายการนั้น
  if (!caloriesValue || !proteinValue || !fatValue || !carbsValue) {
    skippedCount += 1;
    return;
  }

  // สร้างข้อมูล food row ตาม schema ของแอป
  foodsOutput.push({
    external_code: `USDA-${fdcId}`,
    name_th: '',
    name_en: sanitizeText(foodRecord.description),
    category: normalizeCategoryName(foodRecord.food_category_id, categoryMap),
    source_name: 'USDA FoodData Central Foundation Foods April 2026',
    is_verified: 'true',
    is_active: 'true',
  });

  // สร้าง serving row แบบ 100 g ตามที่ต้องการ
  servingsOutput.push({
    external_code: `USDA-${fdcId}`,
    serving_name: '100 g',
    grams: '100',
    calories_kcal: formatNumber(caloriesValue),
    protein_g: formatNumber(proteinValue),
    carbs_g: formatNumber(carbsValue),
    fat_g: formatNumber(fatValue),
    fiber_g: formatNumber(getNutrientAmountById(foodNutrientsForFood, '1079')),
    sugar_g: formatNumber(getNutrientAmountById(foodNutrientsForFood, '1063')),
    sodium_mg: formatNumber(getNutrientAmountById(foodNutrientsForFood, '1093')),
  });

  passedCount += 1;
});

ensureDirectory(outputDir);

const foodsHeaders = ['external_code', 'name_th', 'name_en', 'category', 'source_name', 'is_verified', 'is_active'];
const servingsHeaders = ['external_code', 'serving_name', 'grams', 'calories_kcal', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g', 'sodium_mg'];

fs.writeFileSync(outputFoodsCsvPath, buildCsvContent(foodsOutput, foodsHeaders));
fs.writeFileSync(outputServingsCsvPath, buildCsvContent(servingsOutput, servingsHeaders));

console.log(`Input rows from food.csv: ${foods.length}`);
console.log(`Foundation foods selected: ${selectedFoundationFoodCount}`);
console.log(`Foods passed: ${passedCount}`);
console.log(`Foods skipped: ${skippedCount}`);
console.log(`Output files created:`);
console.log(`- ${outputFoodsCsvPath}`);
console.log(`- ${outputServingsCsvPath}`);
