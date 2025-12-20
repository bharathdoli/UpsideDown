-- Ratings (likes) for notes
create table if not exists public.note_ratings (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (note_id, user_id)
);

alter table public.note_ratings enable row level security;

create policy "Users can manage their own note ratings"
  on public.note_ratings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- Comments for notes
create table if not exists public.note_comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.note_comments enable row level security;

create policy "Users can insert their own note comments"
  on public.note_comments
  for insert
  with check (auth.uid() = user_id);

create policy "Users can read note comments"
  on public.note_comments
  for select
  using (true);


