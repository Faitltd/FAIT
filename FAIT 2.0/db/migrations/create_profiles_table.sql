-- Create profiles table that extends the auth.users data
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  phone text,
  company text,
  job_title text,
  user_type text not null default 'standard',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies for secure access
-- Allow users to view their own profile
create policy "Users can view their own profile" 
  on profiles for select 
  using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile" 
  on profiles for update 
  using (auth.uid() = id);

-- Allow users to insert their own profile
create policy "Users can insert their own profile" 
  on profiles for insert 
  with check (auth.uid() = id);

-- Create storage bucket for avatars if it doesn't exist
-- Check if bucket exists first to avoid errors
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'user-avatars') then
    insert into storage.buckets (id, name, public) values ('user-avatars', 'user-avatars', true);
  end if;
end $$;

-- Set up storage policies for avatars
-- First, drop existing policies if they exist to avoid errors
drop policy if exists "Avatar images are publicly accessible" on storage.objects;
drop policy if exists "Users can upload their own avatar" on storage.objects;
drop policy if exists "Users can update their own avatar" on storage.objects;

-- Create new policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'user-avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'user-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create a function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, user_type)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'standard');
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create a profile when a new user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
