-- Lost and Found feature
create table if not exists public.lost_and_found (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  college text not null,
  item_type text not null check (item_type in ('lost', 'found')),
  title text not null,
  description text,
  category text, -- e.g., 'electronics', 'books', 'clothing', 'accessories', 'other'
  location text, -- Where it was lost/found
  contact_info text, -- Phone or email for contact
  image_url text, -- Photo of the item
  status text not null default 'active' check (status in ('active', 'resolved', 'claimed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lost_and_found_college_idx on public.lost_and_found (college, status);
create index if not exists lost_and_found_item_type_idx on public.lost_and_found (item_type, status);
create index if not exists lost_and_found_category_idx on public.lost_and_found (category);

alter table public.lost_and_found enable row level security;

create policy "Users can view all lost and found items"
  on public.lost_and_found
  for select
  using (true);

create policy "Users can create lost and found items"
  on public.lost_and_found
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own items"
  on public.lost_and_found
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own items"
  on public.lost_and_found
  for delete
  using (auth.uid() = user_id);

