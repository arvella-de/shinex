-- ============================================================================
-- Shinex Car Wash â€” Supabase schema, RLS policies, and grants
-- Run this file in the Supabase SQL Editor (or via the CLI: supabase db execute)
-- Content tables (services, blog, faqs, reviews, about) are read-only via the
-- API. Edits are made in Supabase Studio (Table Editor) only â€” the in-app admin
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

-- Seed data

-- Seed data generated from data/db.json (2026-09-24T10:33:08.941Z)

insert into public.services (id, name, description, long_description, category, price, duration_minutes, active, sort_order) values
  ($shx$svc-basic-ext$shx$, $shx$Basic Exterior Wash$shx$, $shx$A quick and effective exterior clean that removes everyday dirt, dust, and road grime.$shx$, $shx$Our Basic Exterior Wash is designed for drivers who need a quick, effective clean. We rinse the entire exterior to remove loose dirt, apply a foam wash to lift grime, and hand-dry with microfiber towels to prevent water spots. Covers all body panels, bumpers, and door jambs.$shx$, $shx$Exterior Cleaning$shx$, 300, 15, true, 1),
  ($shx$svc-premium-ext$shx$, $shx$Premium Exterior Wash$shx$, $shx$A more thorough exterior wash including detailed cleaning of the body, wheels, and exterior surfaces.$shx$, $shx$The Premium Exterior Wash goes beyond the basics with detailed attention to every exterior surface. We clean the body panels, wheel arches, mirrors, and door handles with care. Wheels and tires receive a dedicated cleaning, and all glass is wiped clean for clear visibility.$shx$, $shx$Exterior Cleaning$shx$, 600, 25, true, 2),
  ($shx$svc-foam$shx$, $shx$Foam Wash$shx$, $shx$A foam-based cleaning service that helps loosen dirt and grime before a thorough rinse and wash.$shx$, $shx$Our Foam Wash uses a thick layer of cleaning foam that clings to the vehicle surface, loosening dirt and grime before contact washing. This gentle approach helps reduce the risk of swirl marks while delivering a thorough clean across the entire exterior.$shx$, $shx$Exterior Cleaning$shx$, 500, 20, true, 3),
  ($shx$svc-pressure$shx$, $shx$Pressure Wash$shx$, $shx$High-pressure cleaning designed to remove stubborn dirt and buildup from suitable exterior areas.$shx$, $shx$The Pressure Wash uses controlled high-pressure water to blast away stubborn dirt, mud, and buildup from exterior surfaces. Ideal for vehicles that have been driven on muddy roads or exposed to heavy grime. We carefully control pressure to protect your paint while removing tough contaminants.$shx$, $shx$Exterior Cleaning$shx$, 400, 20, true, 4),
  ($shx$svc-wheel-tire$shx$, $shx$Wheel & Tire Cleaning$shx$, $shx$Detailed cleaning of wheels and tires to remove brake dust, mud, dirt, and road grime.$shx$, $shx$Wheels and tires collect brake dust, road grime, and mud that regular washing may not fully remove. Our Wheel & Tire Cleaning service uses specialized cleaners and brushes to thoroughly clean each wheel, tire wall, and wheel well, restoring a clean, fresh appearance.$shx$, $shx$Exterior Cleaning$shx$, 350, 15, true, 5),
  ($shx$svc-rim$shx$, $shx$Rim Cleaning$shx$, $shx$Careful cleaning of your vehicle's rims to remove dirt and buildup while maintaining their appearance.$shx$, $shx$Rims accumulate brake dust and road dirt that can damage their finish over time. Our Rim Cleaning service carefully removes buildup from rim surfaces, spokes, and crevices using products safe for your rim type, helping maintain their appearance and condition.$shx$, $shx$Exterior Cleaning$shx$, 400, 20, true, 6),
  ($shx$svc-wax-wash$shx$, $shx$Wax Wash$shx$, $shx$A wash combined with a protective wax treatment that enhances shine and provides surface protection.$shx$, $shx$Our Wax Wash combines a thorough exterior wash with a hand-applied wax coating. The wax adds a layer of protection against UV rays, dust, and water spots while giving your vehicle a deep, reflective shine. A great option for maintaining your car's appearance between full detailing sessions.$shx$, $shx$Exterior Cleaning$shx$, 800, 35, true, 7),
  ($shx$svc-vacuum$shx$, $shx$Interior Vacuuming$shx$, $shx$Thorough vacuuming of seats, carpets, mats, and other accessible areas to remove dust and debris.$shx$, $shx$Our Interior Vacuuming service covers all accessible areas of your vehicle's cabin including seats, carpets, floor mats, boot area, and between seat crevices. We use powerful commercial vacuums to remove dust, dirt, crumbs, and debris, leaving your interior noticeably cleaner.$shx$, $shx$Interior Cleaning$shx$, 200, 15, true, 8),
  ($shx$svc-dashboard$shx$, $shx$Dashboard & Console Cleaning$shx$, $shx$Cleaning and wiping of the dashboard, center console, door panels, and other interior surfaces.$shx$, $shx$The Dashboard & Console Cleaning service wipes down and conditions all hard interior surfaces including the dashboard, center console, steering wheel, gear shift, door panels, and air vents. We use interior-safe products that clean without leaving greasy residue.$shx$, $shx$Interior Cleaning$shx$, 300, 20, true, 9),
  ($shx$svc-carpet$shx$, $shx$Carpet Cleaning$shx$, $shx$Deep cleaning of vehicle carpets to remove accumulated dirt and stains.$shx$, $shx$Vehicle carpets trap dirt, mud, and stains from daily use. Our Carpet Cleaning service uses extraction cleaning and targeted stain removal to restore your carpets. We pre-treat visible stains, deep clean the carpet fibers, and extract dirty water for a thorough result.$shx$, $shx$Interior Cleaning$shx$, 600, 30, true, 10),
  ($shx$svc-seat-clean$shx$, $shx$Seat Cleaning$shx$, $shx$Cleaning of vehicle seats using methods appropriate for the seat material.$shx$, $shx$Seats accumulate dirt, oils, and stains from regular use. Our Seat Cleaning service adapts to your seat material â€” fabric seats receive deep extraction cleaning while leather seats are cleaned and conditioned. We address visible stains and restore a fresh, clean appearance.$shx$, $shx$Interior Cleaning$shx$, 500, 25, true, 11),
  ($shx$svc-mat$shx$, $shx$Mat Cleaning$shx$, $shx$Removal of dirt and debris from floor mats to keep your vehicle's interior cleaner.$shx$, $shx$Floor mats take the most abuse from shoes and weather. Our Mat Cleaning service removes mats, pressure-rinse loose dirt, scrub away ground-in grime, and dry them thoroughly before replacing. Rubber, carpet, and custom mats are all serviced.$shx$, $shx$Interior Cleaning$shx$, 200, 15, true, 12),
  ($shx$svc-interior-deep$shx$, $shx$Interior Deep Cleaning$shx$, $shx$A detailed interior cleaning service covering multiple areas of the cabin for a cleaner environment.$shx$, $shx$Our Interior Deep Cleaning is a comprehensive service that covers every accessible area of your vehicle's cabin. We vacuum all surfaces, shampoo seats and carpets, clean the dashboard and console, condition door panels, clean air vents, and finish with an interior protectant. Perfect for vehicles that haven't had professional interior cleaning in a while.$shx$, $shx$Interior Cleaning$shx$, 1200, 45, true, 13),
  ($shx$svc-full-wash$shx$, $shx$Full Wash$shx$, $shx$A complete exterior and interior cleaning service for a thorough clean inside and out.$shx$, $shx$The Full Wash combines our exterior and interior services into one convenient package. Your vehicle receives a thorough exterior wash including body, wheels, and glass, plus an interior vacuum, dashboard wipe-down, and mat cleaning. A popular choice for regular maintenance.$shx$, $shx$Full Cleaning & Detailing$shx$, 700, 35, true, 14),
  ($shx$svc-full-ie$shx$, $shx$Full Interioar & Exterior Cleaning$shx$, $shx$A comprehensive cleaning package covering the major interior and exterior surfaces.$shx$, $shx$This comprehensive package covers all major interior and exterior areas of your vehicle. The exterior receives a thorough wash, wheel cleaning, and glass treatment. The interior is vacuumed, surfaces are wiped and conditioned, mats are cleaned, and the cabin is freshened. Ideal for drivers who want a complete clean in one visit.$shx$, $shx$Full Cleaning & Detailing$shx$, 1200, 50, true, 15),
  ($shx$svc-full-detail$shx$, $shx$Full Car Detailing$shx$, $shx$A detailed cleaning service designed to give your vehicle a refreshed and well-maintained appearance.$shx$, $shx$Full Car Detailing goes beyond a standard wash to restore your vehicle's appearance. Exterior work includes a multi-stage wash, clay bar treatment, and wax application. Interior receives deep cleaning of all surfaces, carpet extraction, leather conditioning where applicable, and UV protectant on trim and dashboard.$shx$, $shx$Full Cleaning & Detailing$shx$, 2500, 90, true, 16),
  ($shx$svc-premium-detail$shx$, $shx$Premium Detailing$shx$, $shx$A comprehensive detailing package for an extensive vehicle cleaning and finishing service.$shx$, $shx$Our Premium Detailing service is designed for drivers who want the highest level of care. It includes everything in Full Detailing plus additional paint correction, ceramic sealant application, engine bay cleaning, and detailed leather treatment. Your vehicle will look and feel its absolute best.$shx$, $shx$Full Cleaning & Detailing$shx$, 4500, 150, true, 17),
  ($shx$svc-deep-package$shx$, $shx$Deep Cleaning Package$shx$, $shx$A detailed cleaning package focused on areas that require extra attention and cleaning.$shx$, $shx$The Deep Cleaning Package targets areas that accumulate the most dirt and bacteria over time. We deep-clean carpets and upholstery, sanitize air vents, clean under seats, treat door jambs and seals, and address any stubborn stains or odors. Ideal for vehicles that need more than a standard clean.$shx$, $shx$Full Cleaning & Detailing$shx$, 3000, 120, true, 18),
  ($shx$svc-showroom$shx$, $shx$Showroom Finish Package$shx$, $shx$A premium service designed to give your vehicle a highly polished, clean, and refreshed appearance.$shx$, $shx$Our Showroom Finish Package is the ultimate transformation. Your vehicle receives a complete exterior detail including paint correction, machine polishing, and protective coating. The interior is fully detailed with leather conditioning, carpet extraction, and trim restoration. Designed for special occasions, vehicle sales, or when you simply want the best.$shx$, $shx$Full Cleaning & Detailing$shx$, 5000, 180, true, 19),
  ($shx$svc-hand-wax$shx$, $shx$Hand Waxing$shx$, $shx$Hand-applied wax to enhance the vehicle's shine and provide surface protection.$shx$, $shx$Our Hand Waxing service applies a high-quality wax by hand to every painted surface of your vehicle. The wax creates a protective barrier against UV rays, rain, and contaminants while delivering a deep, glossy shine. Hand application ensures even coverage and attention to every panel.$shx$, $shx$Paint & Protection$shx$, 800, 45, true, 20),
  ($shx$svc-paint-protect$shx$, $shx$Paint Protection$shx$, $shx$A service focused on helping protect the vehicle's exterior paint from everyday environmental exposure.$shx$, $shx$Paint Protection applies a durable sealant layer to your vehicle's paintwork. This barrier shields against UV damage, bird droppings, tree sap, road grime, and other environmental contaminants. Regular application helps maintain your paint's color and gloss over time.$shx$, $shx$Paint & Protection$shx$, 2000, 60, true, 21),
  ($shx$svc-ceramic$shx$, $shx$Ceramic Coating$shx$, $shx$A professional protective coating designed to provide durable protection to the vehicle's exterior.$shx$, $shx$Ceramic Coating creates a semi-permanent chemical bond with your vehicle's paint, forming a hard, glossy layer of protection. It resists UV damage, chemical stains, and environmental contaminants while making the surface easier to clean. Professional application ensures proper surface preparation and even coating.$shx$, $shx$Paint & Protection$shx$, 8000, 120, true, 22),
  ($shx$svc-polish$shx$, $shx$Paint Polishing$shx$, $shx$Polishing of suitable painted surfaces to improve their overall appearance and shine.$shx$, $shx$Paint Polishing removes light swirl marks, oxidation, and minor imperfections from your vehicle's paintwork. We use machine or hand polishing techniques with appropriate compounds to restore depth and clarity to the paint, bringing back a smooth, reflective finish.$shx$, $shx$Paint & Protection$shx$, 1500, 60, true, 23),
  ($shx$svc-scratch$shx$, $shx$Scratch & Swirl Treatment$shx$, $shx$Treatment designed to improve the appearance of suitable minor surface imperfections.$shx$, $shx$Our Scratch & Swirl Treatment addresses light scratches, wash marks, and swirl patterns in your vehicle's clear coat. Using progressive polishing techniques, we minimize the visibility of these imperfections and restore a smoother, more uniform appearance to the paint surface.$shx$, $shx$Paint & Protection$shx$, 1200, 45, true, 24),
  ($shx$svc-headlight$shx$, $shx$Headlight Restoration$shx$, $shx$Cleaning and restoration of suitable headlights to improve their appearance and clarity.$shx$, $shx$Cloudy, yellowed headlights reduce visibility and make your vehicle look older. Our Headlight Restoration service sands, polishes, and seals headlight lenses to restore crystal-clear transparency. The result is improved nighttime visibility and a fresher vehicle appearance.$shx$, $shx$Paint & Protection$shx$, 600, 30, true, 25),
  ($shx$svc-engine$shx$, $shx$Engine Bay Cleaning$shx$, $shx$Careful cleaning of accessible engine-bay areas to remove accumulated dirt and grime.$shx$, $shx$Engine Bay Cleaning removes dirt, grease, and grime from accessible areas under the hood. We carefully clean around sensitive components using appropriate techniques, helping your engine look cleaner and making it easier to spot potential issues during maintenance checks.$shx$, $shx$Specialized Services$shx$, 800, 30, true, 26),
  ($shx$svc-underbody$shx$, $shx$Underbody Cleaning$shx$, $shx$Cleaning of accessible underbody areas to remove dirt and road buildup.$shx$, $shx$The underbody of your vehicle accumulates mud, road salt, and grime that can contribute to corrosion over time. Our Underbody Cleaning service uses targeted rinsing and cleaning to remove buildup from accessible undercarriage areas, helping maintain your vehicle's condition.$shx$, $shx$Specialized Services$shx$, 600, 25, true, 27),
  ($shx$svc-pet-hair$shx$, $shx$Pet Hair Removal$shx$, $shx$Specialized cleaning to remove pet hair from seats, carpets, and other interior areas.$shx$, $shx$Pet hair embeds itself into fabric seats, carpets, and headliners in ways regular vacuuming cannot fully address. Our Pet Hair Removal service uses specialized tools and techniques to extract embedded hair from all interior surfaces, leaving your cabin noticeably cleaner.$shx$, $shx$Specialized Services$shx$, 500, 30, true, 28),
  ($shx$svc-odor$shx$, $shx$Odor Removal$shx$, $shx$Treatment designed to reduce unwanted odors and leave the vehicle interior feeling fresher.$shx$, $shx$Persistent odors from food, pets, smoke, or moisture can make your vehicle unpleasant. Our Odor Removal service identifies the source of the smell and applies targeted treatments including deep cleaning, sanitization, and deodorizing to significantly reduce or eliminate unwanted odors.$shx$, $shx$Specialized Services$shx$, 700, 30, true, 29),
  ($shx$svc-leather$shx$, $shx$Leather Seat Treatment$shx$, $shx$Cleaning and conditioning of suitable leather surfaces to help maintain their appearance.$shx$, $shx$Leather seats require regular care to prevent cracking, fading, and premature wear. Our Leather Seat Treatment cleans the leather surface to remove dirt and oils, then applies a quality conditioner to restore moisture and flexibility, helping your seats look and feel their best.$shx$, $shx$Specialized Services$shx$, 900, 30, true, 30),
  ($shx$svc-upholstery$shx$, $shx$Upholstery Cleaning$shx$, $shx$Deep cleaning of suitable fabric and upholstery surfaces to remove dirt and stains.$shx$, $shx$Fabric upholstery traps dirt, stains, and odors over time. Our Upholstery Cleaning service uses extraction cleaning and targeted stain treatment to deep-clean fabric seats, door panels, and other upholstered surfaces, restoring a fresh, clean appearance to your interior.$shx$, $shx$Specialized Services$shx$, 800, 35, true, 31) on conflict (id) do nothing;

insert into public.blog (id, title, slug, excerpt, content, author, tag, reading_time, published_at) values
  ($shx$blog-1$shx$, $shx$How Often Should You Wash Your Car?$shx$, $shx$how-often-should-you-wash-your-car$shx$, $shx$Regular washing can help keep your vehicle looking clean and can remove dirt and contaminants that accumulate during everyday driving.$shx$, $shx$Keeping your car clean is an important part of regular vehicle care. Dirt, dust, mud, road grime, bird droppings, and other contaminants can build up on the exterior as you drive. How often you should wash your car depends on how frequently you drive, the roads you use, weather conditions, and where your vehicle is parked.

For many drivers, a regular wash every couple of weeks can be a useful routine, while vehicles exposed to heavy dirt, muddy roads, or harsh weather may need more frequent cleaning. If your car is visibly dirty or has accumulated substances that could affect the paintwork, it is usually a good idea to clean it sooner rather than waiting for your normal schedule.

A regular wash should focus on removing dirt from the main exterior surfaces, wheels, and other areas where grime accumulates. For everyday maintenance, an exterior wash may be enough. However, if the interior is also becoming dirty, an interior cleaning service can be added.

It is also important to clean your car after particularly dirty journeys or exposure to substances that can be difficult to remove once they dry. Prompt cleaning can make these contaminants easier to remove.

## Make Car Cleaning a Routine

Rather than waiting until your vehicle looks extremely dirty, create a cleaning routine that fits your driving habits. Regular washing keeps your vehicle looking presentable and allows you to notice issues with the exterior earlier.

If your vehicle needs more than a standard wash, consider a full cleaning or detailing service.$shx$, $shx$Shinex Team$shx$, $shx$Car Care$shx$, $shx$4 min read$shx$, $shx$2026-09-01T08:00:00.000Z$shx$),
  ($shx$blog-2$shx$, $shx$Car Washing vs. Car Detailing: What's the Difference?$shx$, $shx$car-washing-vs-car-detailing$shx$, $shx$A car wash focuses primarily on cleaning your vehicle, while detailing involves more thorough cleaning and attention to specific areas.$shx$, $shx$Car washing and car detailing are often used interchangeably, but they are not exactly the same. Understanding the difference can help you choose the service that best suits your vehicle.

A standard car wash focuses mainly on removing dirt and grime from the vehicle. Depending on the package, this can include cleaning the exterior, wheels, tires, and sometimes basic interior areas. It is suitable for routine maintenance when your vehicle simply needs a fresh clean.

Car detailing is more comprehensive. Detailing involves paying closer attention to both the interior and exterior of the vehicle. Depending on the package, it may include deep interior cleaning, carpet and upholstery cleaning, polishing, waxing, paint care, and other specialized treatments.

## When Should You Choose a Car Wash?

A regular wash is useful when your vehicle has accumulated everyday dust, dirt, and road grime. It is a practical option for maintaining a clean appearance.

## When Should You Choose Detailing?

Detailing may be more appropriate when your vehicle needs a deeper clean or when you want to refresh its overall appearance. It can also be useful before a special occasion, after a long period without professional cleaning, or when preparing a vehicle for sale.

## Choosing the Right Service

The best option depends on the condition of your vehicle and the level of cleaning you want. If you are unsure, our team can help you select a suitable service.$shx$, $shx$Shinex Team$shx$, $shx$Guide$shx$, $shx$4 min read$shx$, $shx$2026-09-03T08:00:00.000Z$shx$),
  ($shx$blog-3$shx$, $shx$5 Signs Your Car Needs Interior Deep Cleaning$shx$, $shx$signs-car-needs-interior-deep-cleaning$shx$, $shx$Your vehicle's interior can collect dirt and debris even when the exterior looks clean. Here are five signs it may be time for a deeper clean.$shx$, $shx$Your vehicle's interior can collect dirt and debris even when the exterior looks clean. Because the interior is used every day, regular cleaning can help maintain a more comfortable and pleasant environment.

Here are five signs that your vehicle may benefit from a deep interior cleaning.

## 1. Persistent Odors

If unpleasant smells remain after basic cleaning, the source may be in carpets, upholstery, mats, or other interior surfaces. A deeper cleaning can help address areas where odors may have accumulated.

## 2. Visible Stains

Food, drinks, mud, and everyday use can leave stains on seats, carpets, and other surfaces. Deep cleaning can target these areas more thoroughly.

## 3. Excessive Dust

Dust can accumulate on dashboards, vents, consoles, and other surfaces. If regular wiping is no longer enough, a more comprehensive interior cleaning may be useful.

## 4. Dirty Carpets and Mats

Floor areas receive a lot of use and can collect dirt from shoes. Professional cleaning can help remove accumulated dirt and debris.

## 5. Pet Hair or Debris

Pet hair can be difficult to remove using normal vacuuming. Specialized cleaning can help remove hair and debris from seats, carpets, and other areas.

## Give Your Interior a Fresh Start

If your car's interior has not received a thorough cleaning for some time, an interior deep-cleaning service can give it a refreshed appearance.$shx$, $shx$Shinex Team$shx$, $shx$Interior Care$shx$, $shx$4 min read$shx$, $shx$2026-09-06T08:00:00.000Z$shx$),
  ($shx$blog-4$shx$, $shx$How to Keep Your Car Interior Clean$shx$, $shx$how-to-keep-car-interior-clean$shx$, $shx$Simple habits such as removing rubbish, regularly vacuuming, and dealing with spills quickly can help maintain a cleaner interior.$shx$, $shx$Keeping your car interior clean does not always require a professional service. A few simple habits can make a significant difference between professional cleanings.

Start by removing rubbish from the vehicle regularly. Empty bottles, food packaging, receipts, and other items can quickly make the interior look untidy.

Vacuum the interior regularly, paying attention to seats, carpets, mats, and areas where dirt tends to collect. Floor mats should also be removed and cleaned when necessary.

Clean spills as soon as possible. Leaving drinks or other substances on upholstery for a long time can make stains more difficult to deal with.

The dashboard and other hard surfaces should also be wiped regularly. Avoid using cleaning products that are unsuitable for the material being cleaned.

If you have pets, consider taking additional steps to control hair and dirt. Regular vacuuming can help prevent buildup.

## Don't Forget the Small Areas

Door pockets, cup holders, storage compartments, and areas around the seats can easily be overlooked. Cleaning these areas regularly can make the entire interior feel much fresher.

## When Professional Cleaning Is Needed

Even with regular maintenance, interiors eventually need deeper cleaning. Professional interior cleaning can help address stains, accumulated dirt, odors, upholstery, carpets, and other areas that require more attention.$shx$, $shx$Shinex Team$shx$, $shx$Interior Care$shx$, $shx$4 min read$shx$, $shx$2026-09-09T08:00:00.000Z$shx$),
  ($shx$blog-5$shx$, $shx$Why Regular Car Washing Matters$shx$, $shx$why-regular-car-washing-matters$shx$, $shx$Regular vehicle cleaning helps remove dirt and contaminants that accumulate during everyday driving.$shx$, $shx$A clean vehicle does more than simply look good. Regular washing helps remove dirt and contaminants that accumulate during everyday driving.

Road dust, mud, bird droppings, and other substances can remain on the vehicle's exterior. If they are left for long periods, they can become more difficult to remove.

Regular washing also gives you an opportunity to notice changes in your vehicle's exterior. While cleaning, you may notice scratches, damaged areas, unusual buildup, or other issues that require attention.

Washing the wheels and tires is also an important part of exterior cleaning. These areas can collect road grime and brake dust.

## Cleaning More Than the Exterior

While exterior washing is important, the interior also benefits from regular attention. Vacuuming, wiping surfaces, cleaning mats, and addressing spills can help maintain a more comfortable cabin.

## Choose a Routine That Works for You

The ideal cleaning schedule depends on how you use your vehicle. Someone who drives frequently on dusty or muddy roads may need more frequent cleaning than someone who drives occasionally.

The important thing is to establish a routine rather than waiting until dirt has accumulated heavily.$shx$, $shx$Shinex Team$shx$, $shx$Car Care$shx$, $shx$3 min read$shx$, $shx$2026-09-11T08:00:00.000Z$shx$),
  ($shx$blog-6$shx$, $shx$How to Protect Your Car's Paint$shx$, $shx$how-to-protect-your-cars-paint$shx$, $shx$Your vehicle's paint is exposed to sunlight, dust, rain, and road grime every day. Learn how to care for it.$shx$, $shx$Your vehicle's paint is exposed to many environmental factors every day. Sunlight, dust, rain, road grime, bird droppings, and other contaminants can affect the appearance of the exterior over time.

One of the simplest ways to care for your vehicle's paint is through regular cleaning. Removing dirt and contaminants helps keep the surface clean and makes it easier to identify changes in the paint.

Waxing is another option for customers who want additional surface protection and enhanced shine. Depending on the condition of the vehicle, polishing may also be appropriate for improving the appearance of the paintwork.

For customers looking for longer-term surface protection, specialized options such as ceramic coating may be available.

## Avoid Delaying Cleaning

Some contaminants become harder to remove when they remain on the vehicle for extended periods. Cleaning your vehicle regularly can help prevent excessive buildup.

## Choose the Right Treatment

Not every vehicle requires the same treatment. The appropriate option depends on the condition of the paint, the vehicle's age, how it is used, and the level of protection desired.

If you are unsure whether waxing, polishing, or another treatment is appropriate, speak with a professional before choosing a service.$shx$, $shx$Shinex Team$shx$, $shx$Paint Care$shx$, $shx$4 min read$shx$, $shx$2026-09-13T08:00:00.000Z$shx$),
  ($shx$blog-7$shx$, $shx$How to Choose the Right Car Wash Service$shx$, $shx$how-to-choose-right-car-wash-service$shx$, $shx$Not every vehicle needs the same level of cleaning. Learn when a basic wash may be enough and when more comprehensive services may be appropriate.$shx$, $shx$With several car wash options available, choosing the right service can sometimes be confusing. The best choice depends on what your vehicle needs and how much cleaning you want.

If your vehicle only has normal dust and road dirt, a basic exterior wash may be sufficient. This provides routine cleaning without requiring a more comprehensive service.

If both the inside and outside need attention, a full wash or interior and exterior cleaning package may be more suitable.

For vehicles that need deeper cleaning, consider a detailing service. Detailing typically involves more detailed attention to multiple interior and exterior areas.

Specialized services are also available for specific needs. For example, you may choose pet hair removal if you regularly travel with pets, odor treatment if your vehicle has persistent smells, or upholstery cleaning if your seats require deeper cleaning.

## Consider Your Vehicle's Condition

Before selecting a service, consider:

- How dirty is the exterior?
- Does the interior need cleaning?
- Are there stains or odors?
- Does the paint need additional care?
- When was the vehicle last professionally cleaned?

## Ask for Help When Needed

If you are unsure which service is appropriate, contact our team. We can help you understand the available options and select a service based on your vehicle's needs.$shx$, $shx$Shinex Team$shx$, $shx$Guide$shx$, $shx$4 min read$shx$, $shx$2026-09-15T08:00:00.000Z$shx$),
  ($shx$blog-8$shx$, $shx$How Often Should You Detail Your Car?$shx$, $shx$how-often-should-you-detail-your-car$shx$, $shx$Detailing is more comprehensive than a standard wash. Learn about factors that influence how frequently you may want detailing.$shx$, $shx$Car detailing is more comprehensive than a standard wash, but there is no single schedule that works for every vehicle.

How often you detail your car can depend on how frequently you drive, where you drive, weather conditions, how the vehicle is stored, and how carefully the interior and exterior are maintained between professional services.

A vehicle that is driven every day may benefit from professional detailing more regularly than a vehicle that is used occasionally.

You may also want to consider detailing when the interior has accumulated stains or dirt, when the exterior needs additional attention, or before an important event.

## Detailing vs. Regular Washing

Regular washing should be part of your normal vehicle-care routine. Detailing is a deeper service that can address areas that a standard wash does not cover.

A good approach is to maintain the vehicle through regular cleaning while scheduling detailing when the vehicle requires more comprehensive attention.

## Keep Your Vehicle Looking Its Best

Between detailing appointments, simple habits such as removing rubbish, vacuuming the interior, washing the exterior, and addressing spills quickly can help maintain your vehicle.$shx$, $shx$Shinex Team$shx$, $shx$Detailing$shx$, $shx$3 min read$shx$, $shx$2026-09-17T08:00:00.000Z$shx$),
  ($shx$blog-9$shx$, $shx$Tips for Keeping Your Car Clean Between Washes$shx$, $shx$tips-keeping-car-clean-between-washes$shx$, $shx$Discover simple ways to maintain your vehicle's appearance between professional cleaning appointments.$shx$, $shx$Professional car washing is an important part of vehicle care, but there are several things you can do between appointments to keep your vehicle looking cleaner.

## Remove Rubbish Regularly

Do not allow bottles, food packaging, receipts, and other rubbish to accumulate inside the vehicle. A quick cleanout every few days can make a noticeable difference.

## Clean Spills Quickly

Spills are easier to address when they are fresh. Clean them as soon as possible using products appropriate for the surface.

## Use Floor Mats

Floor mats can help protect the vehicle's carpeting from dirt and moisture. Remove and clean them regularly.

## Keep the Dashboard Clean

Regularly wipe the dashboard and other hard surfaces using suitable cleaning materials.

## Vacuum Regularly

Vacuuming seats, carpets, and mats can help prevent dirt from building up.

## Park Carefully

Whenever possible, parking in a sheltered or covered location can reduce exposure to some environmental elements.

## Schedule Professional Cleaning

Home maintenance can help keep your vehicle clean, but professional cleaning can reach areas that are difficult to maintain yourself.

A regular professional wash or detailing service can help give your vehicle a more comprehensive clean.$shx$, $shx$Shinex Team$shx$, $shx$Tips$shx$, $shx$3 min read$shx$, $shx$2026-09-19T08:00:00.000Z$shx$),
  ($shx$blog-10$shx$, $shx$What Is Included in a Full Car Detail?$shx$, $shx$what-is-included-full-car-detail$shx$, $shx$A full car detail is designed to provide a more comprehensive clean than a standard car wash. Learn what to expect.$shx$, $shx$A full car detail is designed to provide a more comprehensive clean than a standard car wash. The exact services included can vary depending on the detailing package selected.

A typical full detail may include both interior and exterior cleaning.

## Exterior Detailing

Exterior work may include washing the vehicle, cleaning the wheels and tires, removing accumulated dirt, and paying additional attention to exterior surfaces.

Depending on the selected package, additional services such as waxing, polishing, or paint protection may also be available.

## Interior Detailing

Interior work typically includes vacuuming all surfaces, cleaning the dashboard and console, wiping door panels, cleaning air vents, and treating seats and carpets.

Leather seats may receive cleaning and conditioning, while fabric seats may be shampooed or extracted.

## Additional Services

Some detailing packages also include engine bay cleaning, headlight restoration, ceramic coating, or other specialized treatments.

## Choosing the Right Package

The right detailing package depends on your vehicle's condition and your expectations. If you are unsure, our team can recommend a suitable option based on what your vehicle needs.

A full detail is more than a wash â€” it is a comprehensive cleaning and restoration service designed to bring your vehicle closer to its best condition.$shx$, $shx$Shinex Team$shx$, $shx$Detailing$shx$, $shx$4 min read$shx$, $shx$2026-09-21T08:00:00.000Z$shx$) on conflict (id) do nothing;

insert into public.faqs (id, question, answer, category, sort_order) values
  ($shx$faq-gen-1$shx$, $shx$What services do you offer?$shx$, $shx$We offer exterior washing, interior cleaning, full car cleaning, detailing, paint protection, and specialized vehicle cleaning services.$shx$, $shx$General Questions$shx$, 1),
  ($shx$faq-gen-2$shx$, $shx$Where are you located?$shx$, $shx$Our location and contact information are available on our Contact page. Customers can also contact us directly for directions.$shx$, $shx$General Questions$shx$, 2),
  ($shx$faq-gen-3$shx$, $shx$What are your opening hours?$shx$, $shx$Our current opening hours are displayed on the Contact page and may vary depending on the day or public holidays.$shx$, $shx$General Questions$shx$, 3),
  ($shx$faq-gen-4$shx$, $shx$Do I need to book in advance?$shx$, $shx$We recommend booking in advance to secure your preferred date and time. Walk-in availability may depend on the day's schedule.$shx$, $shx$General Questions$shx$, 4),
  ($shx$faq-gen-5$shx$, $shx$Do I need to create an account to book?$shx$, $shx$No. You can make a booking by providing your basic contact and vehicle information without creating an account.$shx$, $shx$General Questions$shx$, 5),
  ($shx$faq-book-1$shx$, $shx$How do I book a car wash?$shx$, $shx$Select a service, choose your vehicle type, select an available date and time, enter your details, and submit the booking.$shx$, $shx$Booking Questions$shx$, 6),
  ($shx$faq-book-2$shx$, $shx$Can I choose my preferred date and time?$shx$, $shx$Yes. The booking system displays available appointment times so you can select a convenient option.$shx$, $shx$Booking Questions$shx$, 7),
  ($shx$faq-book-3$shx$, $shx$Can I change my booking?$shx$, $shx$Contact us as soon as possible if you need to change your appointment. Changes are subject to availability.$shx$, $shx$Booking Questions$shx$, 8),
  ($shx$faq-book-4$shx$, $shx$Can I cancel my booking?$shx$, $shx$Yes. Contact us before your appointment if you need to cancel. Any applicable cancellation policy will be communicated during booking.$shx$, $shx$Booking Questions$shx$, 9),
  ($shx$faq-book-5$shx$, $shx$What happens after I make a booking?$shx$, $shx$You will receive a booking confirmation containing your booking reference, selected service, date, time, and vehicle information.$shx$, $shx$Booking Questions$shx$, 10),
  ($shx$faq-book-6$shx$, $shx$How do I know whether my booking is confirmed?$shx$, $shx$Your booking status can be confirmed through the information provided after booking or by contacting the car wash.$shx$, $shx$Booking Questions$shx$, 11),
  ($shx$faq-svc-1$shx$, $shx$How long does a car wash take?$shx$, $shx$The time depends on the service and vehicle. Basic services may take less time, while full detailing and deep cleaning require more time.$shx$, $shx$Service Questions$shx$, 12),
  ($shx$faq-svc-2$shx$, $shx$Which service should I choose?$shx$, $shx$Choose a service based on what your vehicle needs. A basic wash is suitable for routine cleaning, while detailing and deep-cleaning packages are designed for more comprehensive cleaning.$shx$, $shx$Service Questions$shx$, 13),
  ($shx$faq-svc-3$shx$, $shx$Do you clean both the interior and exterior?$shx$, $shx$Yes. We offer individual interior and exterior services as well as packages that cover both.$shx$, $shx$Service Questions$shx$, 14),
  ($shx$faq-svc-4$shx$, $shx$Do you offer detailing?$shx$, $shx$Yes. We offer full and premium detailing services.$shx$, $shx$Service Questions$shx$, 15),
  ($shx$faq-svc-5$shx$, $shx$Do you clean SUVs and larger vehicles?$shx$, $shx$Yes. We service different vehicle types. Pricing and service duration may vary depending on the vehicle.$shx$, $shx$Service Questions$shx$, 16),
  ($shx$faq-pay-1$shx$, $shx$What payment methods do you accept?$shx$, $shx$Available payment methods should be displayed during the booking process or confirmed with the business.$shx$, $shx$Payment Questions$shx$, 17),
  ($shx$faq-pay-2$shx$, $shx$Do I pay when booking or when I arrive?$shx$, $shx$Payment arrangements depend on the business's current payment policy and will be communicated during the booking process.$shx$, $shx$Payment Questions$shx$, 18),
  ($shx$faq-pay-3$shx$, $shx$Are your prices fixed?$shx$, $shx$Prices displayed on the Services page are based on the selected service and may vary for certain vehicle types or additional requirements.$shx$, $shx$Payment Questions$shx$, 19),
  ($shx$faq-contact$shx$, $shx$How can I contact you if I have another question?$shx$, $shx$You can reach us by phone at +254 712 345 678, by email at hello@shinex.co.ke, or through the Contact page on our website. Our team is happy to help with any questions you may have.$shx$, $shx$Payment Questions$shx$, 20) on conflict (id) do nothing;

insert into public.reviews (id, customer_name, rating, title, comment, service_id, service_name, approved, created_at) values
  ($shx$rev-demo-1$shx$, $shx$James M.$shx$, 5, $shx$Simple booking, great results$shx$, $shx$The booking process was simple and the car was cleaned thoroughly. Everything was ready when I arrived.$shx$, $shx$svc-full-wash$shx$, $shx$Full Wash$shx$, true, $shx$2026-09-01T10:00:00.000Z$shx$),
  ($shx$rev-demo-2$shx$, $shx$Sarah K.$shx$, 5, $shx$Happy with the full cleaning$shx$, $shx$I booked a full interior and exterior cleaning and was happy with the overall service. The car looked and felt much cleaner afterward.$shx$, $shx$svc-full-ie$shx$, $shx$Full Interior & Exterior Cleaning$shx$, true, $shx$2026-09-05T14:30:00.000Z$shx$),
  ($shx$rev-demo-3$shx$, $shx$Brian O.$shx$, 4, $shx$Easy and friendly service$shx$, $shx$Easy booking process and friendly service. I would use the service again.$shx$, $shx$svc-basic-ext$shx$, $shx$Basic Exterior Wash$shx$, true, $shx$2026-09-08T09:15:00.000Z$shx$),
  ($shx$rev-demo-4$shx$, $shx$Mary W.$shx$, 5, $shx$Excellent detailing work$shx$, $shx$The detailing service gave my car a fresh and clean appearance. The staff were professional and helpful.$shx$, $shx$svc-full-detail$shx$, $shx$Full Car Detailing$shx$, true, $shx$2026-09-12T11:00:00.000Z$shx$),
  ($shx$rev-demo-5$shx$, $shx$Daniel T.$shx$, 5, $shx$Very convenient online booking$shx$, $shx$I liked being able to choose my appointment time online. It made the whole process convenient.$shx$, $shx$svc-premium-ext$shx$, $shx$Premium Exterior Wash$shx$, true, $shx$2026-09-15T16:00:00.000Z$shx$) on conflict (id) do nothing;

insert into public.about (id, hero_title, hero_subtitle, story, mission, values, why_choose_us) values (
  1,
  $shx$Professional Car Care, Built Around You$shx$,
  $shx$Shinex Car Wash was founded with a simple idea: make professional car care easy and accessible for every driver in Nairobi.$shx$,
  $shx$Shinex Car Wash was founded with a simple idea: make professional car care easy and accessible for every driver in Nairobi. What started as a small team with a passion for clean vehicles has grown into a trusted car wash and detailing service known for quality workmanship, honest pricing, and genuine customer care.

We understand that your time is valuable. That is why we built an online booking system that lets you choose your service, pick a date and time, and show up knowing your bay is ready. No queues, no guessing, no hassle.

Every vehicle that comes through our bay receives the same level of attention and care, whether it is a quick exterior wash or a full showroom-detail package. We use quality products, proven techniques, and a team that takes pride in every job.$shx$,
  $shx$To provide convenient, professional, and reliable car wash and detailing services that keep Nairobi's vehicles looking their best â€” without the stress of long waits or uncertain quality.

We are committed to making car care simple: easy online booking, transparent pricing, honest communication, and a team that genuinely cares about the results.$shx$,
  $shx$[{"title":"Quality Workmanship","description":"Every vehicle receives careful, thorough attention. We do not cut corners â€” we take pride in delivering results that meet professional standards."},{"title":"Honest Pricing","description":"What you see on our website is what you pay. No hidden fees, no surprise charges, no pressure upsells at the counter."},{"title":"Convenience","description":"Online booking, flexible appointment times, and efficient service so you can get your car cleaned without disrupting your day."},{"title":"Customer Care","description":"We treat every vehicle like it is our own and every customer like a neighbour. Your satisfaction is not just a goal â€” it is the standard we hold ourselves to."}]$shx$::jsonb,
  $shx$["Simple online booking â€” choose your service and schedule in under a minute","Professional cleaning using quality products and proven techniques","Experienced, trained staff who take pride in their work","Flexible appointment times that work around your schedule","Transparent pricing with no hidden costs","A full range of services from quick washes to complete detailing"]$shx$::jsonb
) on conflict (id) do nothing;

