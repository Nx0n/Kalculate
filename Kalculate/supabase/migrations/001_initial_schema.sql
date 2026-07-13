-- Migration 001: สร้างโครงสร้างฐานข้อมูลสำหรับแอปติดตามอาหารและแคลอรี่
-- Supabase PostgreSQL จะรันไฟล์นี้ใน SQL Editor หรือ CLI migration

create extension if not exists pgcrypto;

-- สร้าง enum สำหรับประเภทมื้ออาหาร
create type public.meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');
create type public.user_goal as enum ('lose_weight', 'maintain', 'gain_weight');
create type public.activity_level as enum ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- ตาราง profiles เก็บข้อมูลผู้ใช้ที่เชื่อมกับ auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  sex text check (sex in ('male', 'female')),
  birth_date date,
  height_cm numeric(5,2) check (height_cm > 0),
  current_weight_kg numeric(5,2) check (current_weight_kg > 0),
  activity_level public.activity_level,
  goal public.user_goal default 'maintain',
  weekly_weight_change_kg numeric(3,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ตาราง weight_logs เก็บประวัติน้ำหนักต่อวัน
create table if not exists public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  weight_kg numeric(5,2) not null check (weight_kg > 0),
  logged_at date not null default current_date,
  created_at timestamptz default now(),
  unique(user_id, logged_at)
);

-- ตาราง foods คือข้อมูลอาหารกลางที่ทีมงานดูแล
create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  name_th text not null,
  name_en text,
  brand_name text,
  category text not null,
  barcode text unique,
  image_url text,
  source_name text,
  is_verified boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ตาราง food_servings เก็บสารอาหารต่อหน่วยบริโภคของอาหารแต่ละรายการ
create table if not exists public.food_servings (
  id uuid primary key default gen_random_uuid(),
  food_id uuid references public.foods(id) on delete cascade,
  serving_name text not null,
  grams numeric(8,2) not null check (grams > 0),
  calories_kcal numeric(8,2) not null check (calories_kcal >= 0),
  protein_g numeric(8,2) default 0 check (protein_g >= 0),
  carbs_g numeric(8,2) default 0 check (carbs_g >= 0),
  fat_g numeric(8,2) default 0 check (fat_g >= 0),
  fiber_g numeric(8,2) default 0 check (fiber_g >= 0),
  sugar_g numeric(8,2) default 0 check (sugar_g >= 0),
  sodium_mg numeric(8,2) default 0 check (sodium_mg >= 0),
  created_at timestamptz default now()
);

-- ตาราง meal_logs เก็บหัวข้อของมื้ออาหารต่อวันตามประเภทมื้อ
create table if not exists public.meal_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  meal_date date not null default current_date,
  meal_type public.meal_type not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, meal_date, meal_type)
);

-- ตาราง meal_log_items เก็บ snapshot ของ nutrition ณ เวลาเพิ่มรายการอาหาร
-- เราเก็บ snapshot นี้ไว้เพราะประวัติต้องไม่ถูกกระทบเมื่อข้อมูลอาหารเปลี่ยนในอนาคต
create table if not exists public.meal_log_items (
  id uuid primary key default gen_random_uuid(),
  meal_log_id uuid references public.meal_logs(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  serving_id uuid references public.food_servings(id) on delete set null,
  food_name text not null,
  serving_name text not null,
  quantity numeric(8,2) not null check (quantity > 0),
  grams numeric(8,2) not null check (grams > 0),
  calories_kcal numeric(8,2) not null check (calories_kcal >= 0),
  protein_g numeric(8,2) not null default 0 check (protein_g >= 0),
  carbs_g numeric(8,2) not null default 0 check (carbs_g >= 0),
  fat_g numeric(8,2) not null default 0 check (fat_g >= 0),
  fiber_g numeric(8,2) not null default 0 check (fiber_g >= 0),
  sugar_g numeric(8,2) not null default 0 check (sugar_g >= 0),
  sodium_mg numeric(8,2) not null default 0 check (sodium_mg >= 0),
  created_at timestamptz default now()
);

-- สร้าง index ที่จำเป็นเพื่อให้ query เร็วขึ้น
create index if not exists idx_foods_name_th on public.foods using gin (to_tsvector('simple', coalesce(name_th, '')));
create index if not exists idx_foods_barcode on public.foods(barcode);
create index if not exists idx_food_servings_food_id on public.food_servings(food_id);
create index if not exists idx_meal_logs_user_date on public.meal_logs(user_id, meal_date);
create index if not exists idx_meal_log_items_meal_log_id on public.meal_log_items(meal_log_id);
create index if not exists idx_weight_logs_user_date on public.weight_logs(user_id, logged_at);

-- function สำหรับสร้าง profiles อัตโนมัติเมื่อ auth.users ถูกสร้าง
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->> 'display_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- function สำหรับอัปเดต updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger foods_updated_at
before update on public.foods
for each row execute function public.set_updated_at();

create trigger meal_logs_updated_at
before update on public.meal_logs
for each row execute function public.set_updated_at();

-- เปิด Row Level Security สำหรับทุกตาราง
alter table public.profiles enable row level security;
alter table public.weight_logs enable row level security;
alter table public.foods enable row level security;
alter table public.food_servings enable row level security;
alter table public.meal_logs enable row level security;
alter table public.meal_log_items enable row level security;

-- policies สำหรับ profiles
-- drop policy มีไว้ให้รัน migration ซ้ำได้ โดยลบ policy เดิมก่อนสร้างใหม่

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());

-- policies สำหรับ weight_logs
drop policy if exists weight_logs_select_own on public.weight_logs;
create policy weight_logs_select_own on public.weight_logs
for select using (user_id = auth.uid());

drop policy if exists weight_logs_insert_own on public.weight_logs;
create policy weight_logs_insert_own on public.weight_logs
for insert with check (user_id = auth.uid());

drop policy if exists weight_logs_update_own on public.weight_logs;
create policy weight_logs_update_own on public.weight_logs
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists weight_logs_delete_own on public.weight_logs;
create policy weight_logs_delete_own on public.weight_logs
for delete using (user_id = auth.uid());

-- policies สำหรับ meal_logs
drop policy if exists meal_logs_select_own on public.meal_logs;
create policy meal_logs_select_own on public.meal_logs
for select using (user_id = auth.uid());

drop policy if exists meal_logs_insert_own on public.meal_logs;
create policy meal_logs_insert_own on public.meal_logs
for insert with check (user_id = auth.uid());

drop policy if exists meal_logs_update_own on public.meal_logs;
create policy meal_logs_update_own on public.meal_logs
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists meal_logs_delete_own on public.meal_logs;
create policy meal_logs_delete_own on public.meal_logs
for delete using (user_id = auth.uid());

-- policies สำหรับ meal_log_items ผ่าน EXISTS กับ meal_logs ของผู้ใช้เอง
drop policy if exists meal_log_items_select_own on public.meal_log_items;
create policy meal_log_items_select_own on public.meal_log_items
for select using (
  exists (
    select 1 from public.meal_logs ml
    where ml.id = meal_log_id and ml.user_id = auth.uid()
  )
);

drop policy if exists meal_log_items_insert_own on public.meal_log_items;
create policy meal_log_items_insert_own on public.meal_log_items
for insert with check (
  exists (
    select 1 from public.meal_logs ml
    where ml.id = meal_log_id and ml.user_id = auth.uid()
  )
);

drop policy if exists meal_log_items_update_own on public.meal_log_items;
create policy meal_log_items_update_own on public.meal_log_items
for update using (
  exists (
    select 1 from public.meal_logs ml
    where ml.id = meal_log_id and ml.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.meal_logs ml
    where ml.id = meal_log_id and ml.user_id = auth.uid()
  )
);

drop policy if exists meal_log_items_delete_own on public.meal_log_items;
create policy meal_log_items_delete_own on public.meal_log_items
for delete using (
  exists (
    select 1 from public.meal_logs ml
    where ml.id = meal_log_id and ml.user_id = auth.uid()
  )
);

-- policies สำหรับ foods และ food_servings ให้ authenticated users อ่านได้เท่านั้น
drop policy if exists foods_select_auth on public.foods;
create policy foods_select_auth on public.foods
for select to authenticated using (true);

drop policy if exists food_servings_select_auth on public.food_servings;
create policy food_servings_select_auth on public.food_servings
for select to authenticated using (true);

-- seed ข้อมูลอาหารไทยอย่างน้อย 5 รายการ พร้อม serving
insert into public.foods (id, name_th, name_en, category, source_name, is_verified, is_active)
values
  ('11111111-1111-1111-1111-111111111111', 'ข้าวสวย', 'Steamed Rice', 'ข้าว', 'Seed', true, true),
  ('22222222-2222-2222-2222-222222222222', 'ข้าวกะเพราไก่', 'Thai Basil Chicken Rice', 'อาหารจานหลัก', 'Seed', true, true),
  ('33333333-3333-3333-3333-333333333333', 'ต้มยำกุ้ง', 'Shrimp Tom Yum', 'ซุป', 'Seed', true, true),
  ('44444444-4444-4444-4444-444444444444', 'กล้วยน้ำว้า', 'Banana', 'ผลไม้', 'Seed', true, true),
  ('55555555-5555-5555-5555-555555555555', 'อกไก่ย่าง', 'Grilled Chicken Breast', 'โปรตีน', 'Seed', true, true)
on conflict (id) do nothing;

insert into public.food_servings (id, food_id, serving_name, grams, calories_kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg)
values
  ('61111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '1 จาน', 200, 260, 5, 57, 0.5, 1.5, 0.1, 2),
  ('62222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '1 จาน', 350, 520, 28, 60, 18, 3, 2, 480),
  ('63333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '1 ถ้วย', 250, 180, 20, 12, 8, 2, 3, 620),
  ('64444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '1 ผล', 120, 105, 1.3, 27, 0.3, 3.1, 14.4, 1),
  ('65555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', '100 กรัม', 100, 165, 31, 0, 3.6, 0, 0, 74)
on conflict (id) do nothing;
