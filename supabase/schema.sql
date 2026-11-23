-- STIKLY database schema for Supabase (PostgreSQL).
-- Run in the Supabase SQL editor, then run seed.sql. See README for making your first admin.

create extension if not exists pgcrypto;

-- ───────── Profiles (extends auth.users) ─────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

-- ───────── Catalogue ─────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  image_url text,
  blurb text,
  sort_order int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2),
  description text,
  image_url text,
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  sold int not null default 0,
  finish text,
  size text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.sticker_types (
  id text primary key,
  name text not null,
  base_price numeric(10,2) not null
);
insert into public.sticker_types values
  ('vinyl','Die-cut vinyl',25), ('holo','Holographic',35), ('matte','Matte vinyl',28), ('clear','Transparent',30);

-- ───────── Orders ─────────
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  payment_method text not null check (payment_method in ('online','cod')),
  payment_status text not null default 'pending',
  payment_ref text,
  status text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal numeric(10,2) not null,
  shipping numeric(10,2) not null,
  total numeric(10,2) not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  image_url text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  custom jsonb
);

create table public.custom_sticker_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  sticker_type text not null references public.sticker_types(id),
  text_content text,
  quantity int not null,
  image_path text,
  status text not null default 'new' check (status in ('new','in_review','approved','printed')),
  created_at timestamptz not null default now()
);

-- ───────── Reviews, wishlists, misc ─────────
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null check (char_length(body) between 5 and 1000),
  verified boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- ───────── Triggers ─────────
-- Clients cannot choose status/verified/user on reviews.
create function public.reviews_before_insert() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.status := 'pending';
  new.user_id := auth.uid();
  new.verified := new.user_id is not null and exists (
    select 1 from public.orders o join public.order_items i on i.order_id = o.id
    where o.user_id = new.user_id and i.product_id = new.product_id and o.status <> 'cancelled');
  return new;
end $$;
create trigger reviews_before_insert before insert on public.reviews
  for each row execute function public.reviews_before_insert();

create function public.refresh_product_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid := coalesce(new.product_id, old.product_id);
begin
  update public.products p set
    rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews where product_id = pid and status = 'approved'), p.rating),
    review_count = (select count(*) from public.reviews where product_id = pid and status = 'approved')
  where p.id = pid;
  return null;
end $$;
create trigger reviews_rating after insert or update or delete on public.reviews
  for each row execute function public.refresh_product_rating();

-- ───────── Checkout RPCs (prices are recomputed on the server) ─────────
-- Keep shipping constants (49 flat, free from 499) and custom tiers in sync with src/lib/config.js.
create function public.place_order(p_customer jsonb, p_items jsonb, p_payment_method text, p_payment_ref text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  it jsonb; prod public.products; st public.sticker_types;
  qty int; unit numeric; v_sub numeric := 0; v_ship numeric; oid uuid := gen_random_uuid();
  onum text := 'STK-' || to_char(now(), 'YYMM') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
begin
  if p_payment_method not in ('online','cod') then raise exception 'Invalid payment method'; end if;
  if jsonb_array_length(p_items) = 0 then raise exception 'Cart is empty'; end if;
  if coalesce(p_customer->>'name','') = '' or coalesce(p_customer->>'email','') = '' or coalesce(p_customer->>'phone','') = ''
     or coalesce(p_customer->>'address','') = '' or coalesce(p_customer->>'city','') = ''
     or coalesce(p_customer->>'state','') = '' or coalesce(p_customer->>'pincode','') = '' then
    raise exception 'Missing customer details';
  end if;

  -- order row is inserted first (totals fixed afterwards) so items can reference it
  insert into public.orders (id, order_number, user_id, customer_name, email, phone, address, city, state, pincode,
    payment_method, payment_status, payment_ref, subtotal, shipping, total)
  values (oid, onum, auth.uid(), p_customer->>'name', lower(p_customer->>'email'), p_customer->>'phone', p_customer->>'address',
    p_customer->>'city', p_customer->>'state', p_customer->>'pincode', p_payment_method,
    case when p_payment_method = 'online' and p_payment_ref is not null then 'awaiting_verification' else 'pending' end,
    p_payment_ref, 0, 0, 0);

  for it in select * from jsonb_array_elements(p_items) loop
    qty := (it->>'quantity')::int;
    if qty is null or qty < 1 or qty > 500 then raise exception 'Invalid quantity'; end if;
    if it ? 'custom' then
      select * into st from public.sticker_types where id = it->'custom'->>'type';
      if not found or qty < 5 then raise exception 'Invalid custom sticker'; end if;
      unit := round(st.base_price * case when qty >= 50 then 0.8 when qty >= 20 then 0.9 else 1 end, 2);
      insert into public.order_items (order_id, name, image_url, unit_price, quantity, custom)
        values (oid, 'Custom ' || st.name, null, unit, qty, it->'custom');
      insert into public.custom_sticker_requests (order_id, user_id, sticker_type, text_content, quantity, image_path)
        values (oid, auth.uid(), st.id, it->'custom'->>'text', qty, it->'custom'->>'image_path');
    else
      select * into prod from public.products where id = (it->>'product_id')::uuid and is_active for update;
      if not found then raise exception 'A product in your cart is no longer available'; end if;
      if prod.stock < qty then raise exception 'Not enough stock for %', prod.name; end if;
      update public.products set stock = stock - qty, sold = sold + qty where id = prod.id;
      unit := prod.price;
      insert into public.order_items (order_id, product_id, name, image_url, unit_price, quantity)
        values (oid, prod.id, prod.name, prod.image_url, unit, qty);
    end if;
    v_sub := v_sub + unit * qty;
  end loop;

  v_ship := case when v_sub >= 499 then 0 else 49 end;
  update public.orders set subtotal = v_sub, shipping = v_ship, total = v_sub + v_ship where id = oid;
  return jsonb_build_object('order_number', onum, 'total', v_sub + v_ship);
end $$;
grant execute on function public.place_order(jsonb, jsonb, text, text) to anon, authenticated;

create function public.track_order(p_number text, p_email text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('order_number', o.order_number, 'status', o.status, 'payment_status', o.payment_status,
    'total', o.total, 'created_at', o.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('name', i.name, 'quantity', i.quantity)), '[]'::jsonb)
              from public.order_items i where i.order_id = o.id))
  from public.orders o where o.order_number = upper(trim(p_number)) and o.email = lower(trim(p_email))
$$;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ───────── Row Level Security ─────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.sticker_types enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.custom_sticker_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- profiles: read/update own non-privileged columns; admins read all
create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create policy "categories public read" on public.categories for select using (true);
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "products public read" on public.products for select using (is_active or public.is_admin());
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "sticker types public read" on public.sticker_types for select using (true);
create policy "sticker types admin write" on public.sticker_types for all using (public.is_admin()) with check (public.is_admin());

-- orders are created only through place_order(); customers read their own, admins manage all
create policy "orders read own or admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders admin update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
create policy "order items read own or admin" on public.order_items for select
  using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "custom requests read own or admin" on public.custom_sticker_requests for select using (user_id = auth.uid() or public.is_admin());
create policy "custom requests admin update" on public.custom_sticker_requests for update using (public.is_admin()) with check (public.is_admin());

create policy "reviews read approved, own or admin" on public.reviews for select
  using (status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "reviews anyone can submit" on public.reviews for insert with check (true);
create policy "reviews admin update" on public.reviews for update using (public.is_admin()) with check (public.is_admin());
create policy "reviews admin delete" on public.reviews for delete using (public.is_admin());

create policy "wishlist own" on public.wishlists for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "newsletter anyone can subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "newsletter admin read" on public.newsletter_subscribers for select using (public.is_admin());
create policy "contact anyone can send" on public.contact_messages for insert with check (true);
create policy "contact admin read" on public.contact_messages for select using (public.is_admin());

-- ───────── Storage ─────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('custom-uploads', 'custom-uploads', false) on conflict do nothing;

create policy "product images public read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product images admin write" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin update" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product images admin delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());
create policy "custom uploads anyone can upload" on storage.objects for insert with check (bucket_id = 'custom-uploads');
create policy "custom uploads admin read" on storage.objects for select using (bucket_id = 'custom-uploads' and public.is_admin());
