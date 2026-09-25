-- ============================================================================
-- Shinex Car Wash — Supabase schema, RLS policies, and grants
-- Run this file in the Supabase SQL Editor (or via the CLI: supabase db execute)
-- Content tables (services, blog, faqs, reviews, about) are read-only via the
-- API. Edits are made in Supabase Studio (Table Editor) only — the in-app admin
-- no longer manages content.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

create table if not exists public.services (
  id               text primary key,
  name             text not null,
  description      text not null,
  long_description text,
  category         text not null,
  price            integer not null check (price >= 0),
  duration_minutes integer not null check (duration_minutes > 0),
  active           boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

create table if not exists public.blog (
  id           text primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text not null,
  author       text not null default 'Shinex Team',
  tag          text not null,
  reading_time text not null default '5 min read',
  published_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id         text primary key,
  question   text not null,
  answer     text not null,
  category   text not null,
  sort_order integer not null default 0
);

create table if not exists public.reviews (
  id            text primary key,
  customer_name text not null,
  rating        integer not null check (rating between 1 and 5),
  title         text,
  comment       text not null,
  service_id    text references public.services (id) on delete set null,
  service_name  text,
  approved      boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.about (
  id             integer primary key default 1 check (id = 1),
  hero_title     text not null,
  hero_subtitle  text not null,
  story          text not null,
  mission        text not null,
  values         jsonb not null,
  why_choose_us  jsonb not null,
  updated_at     timestamptz not null default now()
);

create table if not exists public.bookings (
  id            text primary key,
  ref           text not null unique,
  customer_name text not null,
  phone         text not null,
  vehicle_type  text not null,
  reg_number    text not null,
  service_ids   text[] not null default '{}',
  service_names text[] not null default '{}',
  price         integer not null check (price >= 0),
  date          date not null,
  time_slot     text not null,
  status        text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  manage_token  text not null default '',
  created_at    timestamptz not null default now()
);

-- Secret token that lets the anonymous customer view/edit/cancel their own
-- booking. Added idempotently (existing tables won't have the column), then
-- backfilled for rows created before this feature shipped.
alter table public.bookings add column if not exists manage_token text not null default '';
update public.bookings
set manage_token = substr(md5(random()::text || ref || clock_timestamp()::text), 1, 24)
where manage_token = '';

create table if not exists public.notifications (
  id         bigint generated always as identity primary key,
  type       text not null
    check (type in ('new_booking', 'booking_updated', 'booking_cancelled')),
  message    text not null,
  ref        text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Indexes for the queries the app runs
-- ----------------------------------------------------------------------------

create index if not exists services_active_sort_idx
  on public.services (active, sort_order);
create index if not exists services_category_idx
  on public.services (category);
create index if not exists blog_published_idx
  on public.blog (published_at desc);
create index if not exists blog_tag_idx
  on public.blog (tag);
create index if not exists faqs_sort_idx
  on public.faqs (sort_order);
create index if not exists reviews_service_id_idx
  on public.reviews (service_id);
create index if not exists reviews_approved_idx
  on public.reviews (created_at desc) where approved;
create index if not exists bookings_status_idx
  on public.bookings (status);
create index if not exists bookings_created_idx
  on public.bookings (created_at desc);
create index if not exists notifications_created_idx
  on public.notifications (created_at desc);

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------

alter table public.services  enable row level security;
alter table public.blog      enable row level security;
alter table public.faqs      enable row level security;
alter table public.reviews   enable row level security;
alter table public.about     enable row level security;
alter table public.bookings  enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "Public read services" on public.services;
create policy "Public read services"
  on public.services for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read blog" on public.blog;
create policy "Public read blog"
  on public.blog for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read faqs" on public.faqs;
create policy "Public read faqs"
  on public.faqs for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read about" on public.about;
create policy "Public read about"
  on public.about for select
  to anon, authenticated
  using (true);

drop policy if exists "Read approved reviews" on public.reviews;
create policy "Read approved reviews"
  on public.reviews for select
  to anon, authenticated
  using (approved);

drop policy if exists "Submit a review" on public.reviews;
create policy "Submit a review"
  on public.reviews for insert
  to anon, authenticated
  with check (true);

-- Bookings: public can create, but only authenticated (admin) users can view
-- or change them. No anon select/update/delete policies exist.
drop policy if exists "Public create booking" on public.bookings;
create policy "Public create booking"
  on public.bookings for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admin read bookings" on public.bookings;
create policy "Admin read bookings"
  on public.bookings for select
  to authenticated
  using (true);

drop policy if exists "Admin update bookings" on public.bookings;
create policy "Admin update bookings"
  on public.bookings for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin delete bookings" on public.bookings;
create policy "Admin delete bookings"
  on public.bookings for delete
  to authenticated
  using (true);

-- Notifications feed: single admin, so any authenticated (admin) user can
-- read and clear the feed. Rows are only ever created via the server-side
-- add_notification function below.
drop policy if exists "Admin read notifications" on public.notifications;
create policy "Admin read notifications"
  on public.notifications for select
  to authenticated
  using (true);

drop policy if exists "Admin update notifications" on public.notifications;
create policy "Admin update notifications"
  on public.notifications for update
  to authenticated
  using (true)
  with check (true);

-- ----------------------------------------------------------------------------
-- Grants for the Data (REST) API
-- ----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select on public.services, public.blog, public.faqs, public.reviews, public.about
  to anon, authenticated;
grant insert on public.reviews to anon, authenticated;
grant insert on public.bookings to anon, authenticated;

grant select, update on public.bookings to authenticated;
grant select, update on public.notifications to authenticated;

-- ----------------------------------------------------------------------------
-- Lookup bookings for the public confirmation/manage pages
-- Anon never gets a SELECT policy on bookings. Instead SECURITY DEFINER
-- functions owned by the table owner (which bypass RLS) return exactly the
-- row matching the supplied reference, and never expose manage_token.
--
-- manage_token is the customer's proof of ownership: it is generated at
-- booking time, returned once, and kept in the confirmation link. token-gated
-- functions below can only ever touch a single booking (the one whose token
-- matches), and never let the caller change status/ref/id/manage_token.
-- ----------------------------------------------------------------------------

drop function if exists public.get_booking_by_ref(text);

create or replace function public.get_booking_by_ref(p_ref text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(b) - 'manage_token'
  from public.bookings b
  where b.ref = p_ref;
$$;

drop function if exists public.get_booking_by_ref_token(text, text);

create or replace function public.get_booking_by_ref_token(p_ref text, p_token text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(b) - 'manage_token'
  from public.bookings b
  where b.ref = p_ref and b.manage_token = p_token;
$$;

drop function if exists public.update_booking_customer(text, text, text, text, text, text, text[], text[], integer, date, text);

create or replace function public.update_booking_customer(
  p_ref text,
  p_token text,
  p_customer_name text,
  p_phone text,
  p_vehicle_type text,
  p_reg_number text,
  p_service_ids text[],
  p_service_names text[],
  p_price integer,
  p_date date,
  p_time_slot text
)
returns jsonb
language sql
security definer
set search_path = public
as $$
  update public.bookings b
  set customer_name  = p_customer_name,
      phone          = p_phone,
      vehicle_type   = p_vehicle_type,
      reg_number     = p_reg_number,
      service_ids    = p_service_ids,
      service_names  = p_service_names,
      price          = p_price,
      date           = p_date,
      time_slot      = p_time_slot
  where b.ref = p_ref
    and b.manage_token = p_token
    and b.status not in ('completed', 'cancelled')
  returning to_jsonb(b) - 'manage_token';
$$;

drop function if exists public.cancel_booking_by_token(text, text, date);

create or replace function public.cancel_booking_by_token(p_ref text, p_token text, p_today date)
returns jsonb
language sql
security definer
set search_path = public
as $$
  update public.bookings b
  set status = 'cancelled'
  where b.ref = p_ref
    and b.manage_token = p_token
    and b.status not in ('completed', 'cancelled')
    and b.date > p_today
  returning to_jsonb(b) - 'manage_token';
$$;

-- Admin notification feed: appended to by server-side routes (which use the
-- anon/authenticated client), so this inserts as the table owner.
drop function if exists public.add_notification(text, text, text);

create or replace function public.add_notification(p_type text, p_message text, p_ref text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.notifications (type, message, ref)
  values (p_type, p_message, p_ref);
$$;

revoke all on function public.get_booking_by_ref(text) from public;
revoke all on function public.get_booking_by_ref_token(text, text) from public;
revoke all on function public.update_booking_customer(text, text, text, text, text, text, text[], text[], integer, date, text) from public;
revoke all on function public.cancel_booking_by_token(text, text, date) from public;
revoke all on function public.add_notification(text, text, text) from public;

grant execute on function public.get_booking_by_ref(text) to anon, authenticated;
grant execute on function public.get_booking_by_ref_token(text, text) to anon, authenticated;
grant execute on function public.update_booking_customer(text, text, text, text, text, text, text[], text[], integer, date, text) to anon, authenticated;
grant execute on function public.cancel_booking_by_token(text, text, date) to anon, authenticated;
grant execute on function public.add_notification(text, text, text) to anon, authenticated;