-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  display_name text,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_settings table
create table public.user_settings (
  uid uuid references auth.users on delete cascade not null primary key,
  business_phone text,
  labor_price_per_m2 numeric default 20,
  default_prices jsonb default '{"m2": 20, "empreitada": 0, "diaria": 150, "ambiente": 300, "especifico": 0, "completo": 0}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create estimates table
create table public.estimates (
  id uuid default gen_random_uuid() primary key,
  uid uuid references auth.users on delete cascade not null,
  title text not null,
  client_name text,
  client_phone text,
  property_type text,
  city text,
  neighborhood text,
  location text,
  include_paint boolean default true,
  area numeric not null,
  product_id text,
  color text,
  coats integer default 2,
  pricing_type text default 'm2',
  price_per_m2 numeric,
  fixed_price numeric,
  total_liters numeric,
  package_size text,
  package_count integer,
  material_cost numeric,
  labor_cost numeric,
  total_cost numeric not null,
  date text,
  status text default 'Aguardando',
  media_urls text[],
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create appointments table
create table public.appointments (
  id uuid default gen_random_uuid() primary key,
  uid uuid references auth.users on delete cascade not null,
  client_name text not null,
  client_phone text,
  client_email text,
  client_address text,
  notes text,
  date text not null,
  time text not null,
  status text default 'Pendente',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.estimates enable row level security;
alter table public.appointments enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- User Settings policies
create policy "Users can view their own settings." on public.user_settings
  for select using (auth.uid() = uid);

create policy "Users can insert their own settings." on public.user_settings
  for insert with check (auth.uid() = uid);

create policy "Users can update their own settings." on public.user_settings
  for update using (auth.uid() = uid);

-- Estimates policies
create policy "Users can view their own estimates." on public.estimates
  for select using (auth.uid() = uid);

create policy "Users can insert their own estimates." on public.estimates
  for insert with check (auth.uid() = uid);

create policy "Users can update their own estimates." on public.estimates
  for update using (auth.uid() = uid);

create policy "Users can delete their own estimates." on public.estimates
  for delete using (auth.uid() = uid);

-- Appointments policies
create policy "Users can view their own appointments." on public.appointments
  for select using (auth.uid() = uid);

create policy "Users can insert their own appointments." on public.appointments
  for insert with check (auth.uid() = uid);

create policy "Users can update their own appointments." on public.appointments
  for update using (auth.uid() = uid);

create policy "Users can delete their own appointments." on public.appointments
  for delete using (auth.uid() = uid);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  
  insert into public.user_settings (uid)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Create storage bucket for media
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

-- Storage policies for media
create policy "Media is publicly accessible." on storage.objects
  for select using (bucket_id = 'media');

create policy "Authenticated users can upload media." on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

create policy "Users can delete their own media." on storage.objects
  for delete using (bucket_id = 'media' and auth.uid() = owner);

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
