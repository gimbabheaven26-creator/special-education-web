-- Auth v2.3 Migration
-- profiles + user_data 테이블 생성
-- 2026-03-17

-- ─────────────────────────────────────────
-- 1. profiles 테이블
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS: 본인만 읽기/수정
alter table public.profiles enable row level security;

create policy "profiles: 본인 읽기"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: 본인 수정"
  on public.profiles for update
  using (auth.uid() = id);

-- 신규 유저 가입 시 자동 profile 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

-- 기존 트리거 있으면 삭제 후 재생성
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. user_data 테이블
-- ─────────────────────────────────────────
create table if not exists public.user_data (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  store_key  text not null check (store_key in ('study', 'leitner', 'quiz', 'bookmark')),
  data       jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, store_key)
);

-- RLS: 본인 데이터만 CRUD
alter table public.user_data enable row level security;

create policy "user_data: 본인 읽기"
  on public.user_data for select
  using (auth.uid() = user_id);

create policy "user_data: 본인 삽입"
  on public.user_data for insert
  with check (auth.uid() = user_id);

create policy "user_data: 본인 수정"
  on public.user_data for update
  using (auth.uid() = user_id);

create policy "user_data: 본인 삭제"
  on public.user_data for delete
  using (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_data_updated_at on public.user_data;
create trigger set_user_data_updated_at
  before update on public.user_data
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();
