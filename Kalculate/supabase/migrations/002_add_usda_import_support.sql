-- Migration 002: รองรับการ import USDA foods และ food_servings แบบ idempotent
-- เพิ่มคอลัมน์ external_code เพื่อใช้เป็น key สำหรับจับคู่ข้อมูลระหว่าง foods และ food_servings
alter table public.foods add column if not exists external_code text;

-- ลบ index เดิมที่อาจมีอยู่ก่อนหน้าเพื่อเตรียมสร้าง constraint ใหม่
 drop index if exists public.idx_foods_external_code;

-- สร้าง UNIQUE constraint จริงสำหรับ external_code
-- PostgreSQL จะยอมให้ external_code เป็น NULL หลายแถวได้ตามธรรมชาติของ unique constraint
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'foods_external_code_key'
      and conrelid = 'public.foods'::regclass
  ) then
    alter table public.foods
      add constraint foods_external_code_key unique (external_code);
  end if;
end $$;

-- รักษา unique constraint ของ food_servings สำหรับ upsert
-- ทำให้การ import ซ้ำไม่สร้าง duplicate serving ข้อความเดียวกันซ้ำอีก
create unique index if not exists idx_food_servings_food_serving_grams
  on public.food_servings (food_id, serving_name, grams);

-- comment ภาษาไทยเพื่ออธิบายความหมายของคอลัมน์และ constraint
comment on column public.foods.external_code is 'รหัสอ้างอิงจากแหล่งข้อมูลภายนอก เช่น USDA-321358';
comment on constraint foods_external_code_key on public.foods is 'ความเป็นเอกลักษณ์ของ external_code สำหรับการเชื่อมข้อมูล USDA กับ foods';
comment on index public.idx_food_servings_food_serving_grams is 'ป้องกันการสร้าง food_servings ซ้ำเมื่อ import ข้อมูลเดิมซ้ำ';
