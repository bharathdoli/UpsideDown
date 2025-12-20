-- YouTube Tutorials feature
create table if not exists public.youtube_tutorials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  college text not null,
  title text not null,
  description text,
  youtube_url text not null,
  subject text not null, -- e.g., 'Mathematics', 'Physics', 'Computer Science'
  branch text, -- Optional branch filter
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer, -- Video duration in minutes
  thumbnail_url text, -- YouTube thumbnail
  view_count integer default 0,
  like_count integer default 0,
  created_at timestamptz not null default now()
);

create index if not exists youtube_tutorials_college_idx on public.youtube_tutorials (college);
create index if not exists youtube_tutorials_subject_idx on public.youtube_tutorials (subject);
create index if not exists youtube_tutorials_branch_idx on public.youtube_tutorials (branch);

alter table public.youtube_tutorials enable row level security;

create policy "Users can view all tutorials"
  on public.youtube_tutorials
  for select
  using (true);

create policy "Users can create tutorials"
  on public.youtube_tutorials
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tutorials"
  on public.youtube_tutorials
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tutorials"
  on public.youtube_tutorials
  for delete
  using (auth.uid() = user_id);

-- Tutorial likes
create table if not exists public.tutorial_likes (
  id uuid primary key default gen_random_uuid(),
  tutorial_id uuid not null references public.youtube_tutorials(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(tutorial_id, user_id)
);

create index if not exists tutorial_likes_tutorial_id_idx on public.tutorial_likes (tutorial_id);

alter table public.tutorial_likes enable row level security;

create policy "Users can view tutorial likes"
  on public.tutorial_likes
  for select
  using (true);

create policy "Users can like tutorials"
  on public.tutorial_likes
  for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike tutorials"
  on public.tutorial_likes
  for delete
  using (auth.uid() = user_id);

