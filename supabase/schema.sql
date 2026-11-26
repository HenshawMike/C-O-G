-- Chapel of Glory, Arthur Jarvis University
-- Supabase PostgreSQL Schema (Ready for production Supabase deployment)

create extension if not exists "pgcrypto";

-- 1. Admin Profiles (linked to Supabase auth.users)
create table if not exists public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('super_admin', 'editor')) default 'editor',
  created_at timestamptz not null default now()
);

-- 2. Leadership
create table if not exists public.leaders (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text not null,
  bio text not null default '',
  photo_url text,
  contact_info text,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Programmes
create table if not exists public.programmes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  schedule text not null,
  description text not null,
  details text not null default '',
  theme text not null check (theme in ('electric-blue', 'fiery-red')) default 'electric-blue',
  image_url text,
  is_featured boolean not null default false,
  display_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Twelve Tribes of Israel
create table if not exists public.tribes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tribe_order int not null unique,
  head_name text not null default '',
  head_photo_url text,
  introduction text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  updated_at timestamptz not null default now()
);

-- 5. Tribe Registrations
create table if not exists public.tribe_registrations (
  id uuid primary key default gen_random_uuid(),
  tribe_id uuid not null references public.tribes(id) on delete restrict,
  tribe_name text not null,
  full_name text not null,
  phone text not null,
  email text not null,
  additional_info text not null default '',
  status text not null check (status in ('pending', 'contacted', 'welcomed')) default 'pending',
  created_at timestamptz not null default now()
);

-- 6. Gallery Albums & Photos
create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  title text not null,
  caption text not null default '',
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 7. Contact Enquiries
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  status text not null check (status in ('unread', 'read', 'resolved')) default 'unread',
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.leaders enable row level security;
alter table public.programmes enable row level security;
alter table public.tribes enable row level security;
alter table public.tribe_registrations enable row level security;
alter table public.gallery_albums enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.contact_messages enable row level security;

-- Public read policies
create policy "Public read leaders" on public.leaders for select using (true);
create policy "Public read programmes" on public.programmes for select using (true);
create policy "Public read tribes" on public.tribes for select using (true);
create policy "Public read gallery_albums" on public.gallery_albums for select using (true);
create policy "Public read gallery_photos" on public.gallery_photos for select using (true);

-- Public insert policies for forms
create policy "Public insert tribe_registrations" on public.tribe_registrations for insert with check (true);
create policy "Public insert contact_messages" on public.contact_messages for insert with check (true);
