-- Study Buddy Groups
create table if not exists public.study_groups (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  college text not null,
  description text,
  created_by uuid not null references auth.users(id) on delete cascade,
  max_members integer not null default 5,
  created_at timestamptz not null default now()
);

create table if not exists public.study_group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('creator', 'member')),
  joined_at timestamptz not null default now(),
  unique(group_id, user_id)
);

create index if not exists study_groups_college_idx on public.study_groups (college);
create index if not exists study_group_members_group_id_idx on public.study_group_members (group_id);
create index if not exists study_group_members_user_id_idx on public.study_group_members (user_id);

alter table public.study_groups enable row level security;
alter table public.study_group_members enable row level security;

create policy "Users can view all groups"
  on public.study_groups
  for select
  using (true); -- Allow cross-college collaboration

create policy "Users can create groups"
  on public.study_groups
  for insert
  with check (auth.uid() = created_by);

create policy "Users can view group members"
  on public.study_group_members
  for select
  using (true); -- Allow viewing members of any group for cross-college collaboration

create policy "Users can join/leave groups"
  on public.study_group_members
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

