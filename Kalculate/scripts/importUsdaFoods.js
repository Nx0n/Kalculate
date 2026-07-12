#!/usr/bin/env node

// สคริปต์นี้ import ข้อมูล USDA ที่เตรียมไว้ใน CSV เข้า Supabase
// Workflow:
// 1) import foods ก่อน
// 2) ค้นหา foods.id จาก external_code
// 3) import food_servings พร้อม food_id ที่ถูกต้อง
// 4) ป้องกันข้อมูลซ้ำด้วย upsert และ unique index

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const projectRoot = path.resolve(__dirname, '..');
const envFilePath = path.join(projectRoot, '.env');
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const csvDirIndex = args.indexOf('--csv-dir');
const csvDirectory = csvDirIndex >= 0 && args[csvDirIndex + 1]
  ? path.resolve(projectRoot, args[csvDirIndex + 1])
  : path.join(projectRoot, 'data', 'output');

function loadEnvFile() {
  if (!fs.existsSync(envFilePath)) {
    return;
  }

  const content = fs.readFileSync(envFilePath, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');

    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}

loadEnvFile();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  if (!dryRun) {
    console.error('Missing Supabase configuration. Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    process.exit(1);
  }
} else {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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

function sanitizeText(value) {
  return (value || '').trim();
}

function parseBoolean(value) {
  return sanitizeText(value).toLowerCase() === 'true';
}

function parseNumber(value, options = {}) {
  const { nullable = false } = options;
  const sanitized = sanitizeText(value);
  if (!sanitized) {
    return nullable ? null : 0;
  }

  const numericValue = Number(sanitized);
  return Number.isNaN(numericValue) ? (nullable ? null : 0) : numericValue;
}

function normalizeFoodsRows(rows) {
  return rows
    .map((row) => {
      const externalCode = sanitizeText(row.external_code || row.source_code);
      if (!externalCode) {
        return null;
      }

      return {
        external_code: externalCode,
        name_th: sanitizeText(row.name_th),
        name_en: sanitizeText(row.name_en),
        category: sanitizeText(row.category),
        source_name: sanitizeText(row.source_name),
        is_verified: parseBoolean(row.is_verified),
        is_active: parseBoolean(row.is_active),
      };
    })
    .filter(Boolean);
}

function normalizeServingRows(rows) {
  return rows
    .map((row) => {
      const externalCode = sanitizeText(row.external_code || row.source_code);
      if (!externalCode) {
        return null;
      }

      return {
        external_code: externalCode,
        serving_name: sanitizeText(row.serving_name),
        grams: parseNumber(row.grams),
        calories_kcal: parseNumber(row.calories_kcal),
        protein_g: parseNumber(row.protein_g),
        carbs_g: parseNumber(row.carbs_g),
        fat_g: parseNumber(row.fat_g),
        fiber_g: parseNumber(row.fiber_g, { nullable: true }),
        sugar_g: parseNumber(row.sugar_g, { nullable: true }),
        sodium_mg: parseNumber(row.sodium_mg, { nullable: true }),
      };
    })
    .filter(Boolean);
}

async function importFoods(foodsRows) {
  if (foodsRows.length === 0) {
    return { inserted: 0, foodIdMap: new Map() };
  }

  const { data, error } = await supabase
    .from('foods')
    .upsert(foodsRows, { onConflict: 'external_code', ignoreDuplicates: false })
    .select('id, external_code');

  if (error) {
    throw error;
  }

  const foodIdMap = new Map();
  data.forEach((food) => {
    if (food.external_code) {
      foodIdMap.set(food.external_code, food.id);
    }
  });

  return { inserted: data.length, foodIdMap };
}

async function importFoodServings(servingRows, foodIdMap) {
  const payload = [];
  let skipped = 0;

  servingRows.forEach((row) => {
    const foodId = foodIdMap.get(row.external_code);
    if (!foodId) {
      skipped += 1;
      return;
    }

    payload.push({
      food_id: foodId,
      serving_name: row.serving_name,
      grams: row.grams,
      calories_kcal: row.calories_kcal,
      protein_g: row.protein_g,
      carbs_g: row.carbs_g,
      fat_g: row.fat_g,
      fiber_g: row.fiber_g,
      sugar_g: row.sugar_g,
      sodium_mg: row.sodium_mg,
    });
  });

  if (payload.length === 0) {
    return { inserted: 0, skipped };
  }

  const { data, error } = await supabase
    .from('food_servings')
    .upsert(payload, { onConflict: 'food_id,serving_name,grams', ignoreDuplicates: false })
    .select('id');

  if (error) {
    throw error;
  }

  return { inserted: data.length, skipped };
}

async function main() {
  const foodsCsvPath = path.join(csvDirectory, 'usda_foods.csv');
  const servingsCsvPath = path.join(csvDirectory, 'usda_food_servings.csv');

  if (!fs.existsSync(foodsCsvPath) || !fs.existsSync(servingsCsvPath)) {
    console.error('Missing import CSV files. Please run the transform script first: node scripts/transformUsdaFoundation.js');
    process.exit(1);
  }

  const foodsRows = normalizeFoodsRows(readCsvFile(foodsCsvPath));
  const servingRows = normalizeServingRows(readCsvFile(servingsCsvPath));

  console.log(`Found ${foodsRows.length} food rows and ${servingRows.length} serving rows.`);

  if (dryRun) {
    console.log('Dry run enabled. No data was written to Supabase.');
    console.log(`Would upsert ${foodsRows.length} foods and ${servingRows.length} food servings.`);
    return;
  }

  const { inserted: importedFoods, foodIdMap } = await importFoods(foodsRows);
  console.log(`Imported/updated ${importedFoods} foods into the foods table.`);

  const { inserted: importedServings, skipped } = await importFoodServings(servingRows, foodIdMap);
  console.log(`Imported/updated ${importedServings} food servings.`);
  if (skipped > 0) {
    console.log(`Skipped ${skipped} servings because no matching food was found.`);
  }
}

main().catch((error) => {
  console.error('Import failed.');
  console.error(error);
  process.exit(1);
});
