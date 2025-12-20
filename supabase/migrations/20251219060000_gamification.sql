-- Gamification: Points, Badges, Leaderboards
create table if not exists public.user_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points_total integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_key text not null,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_key)
);

create index if not exists user_points_points_total_idx on public.user_points (points_total desc);
create index if not exists user_badges_user_id_idx on public.user_badges (user_id);

alter table public.user_points enable row level security;
alter table public.user_badges enable row level security;

create policy "Users can view all points"
  on public.user_points
  for select
  using (true);

create policy "Users can view all badges"
  on public.user_badges
  for select
  using (true);

-- Function to add points and check for badge eligibility
create or replace function add_user_points(
  p_user_id uuid,
  p_points integer,
  p_action_type text
)
returns void as $$
declare
  new_total integer;
begin
  -- Insert or update points
  insert into public.user_points (user_id, points_total, updated_at)
  values (p_user_id, p_points, now())
  on conflict (user_id) do update
  set points_total = user_points.points_total + p_points,
      updated_at = now();

  select points_total into new_total from public.user_points where user_id = p_user_id;

  -- Award badges based on thresholds
  if new_total >= 1000 and not exists (select 1 from public.user_badges where user_id = p_user_id and badge_key = 'top_contributor') then
    insert into public.user_badges (user_id, badge_key) values (p_user_id, 'top_contributor');
  end if;

  if new_total >= 500 and not exists (select 1 from public.user_badges where user_id = p_user_id and badge_key = 'active_member') then
    insert into public.user_badges (user_id, badge_key) values (p_user_id, 'active_member');
  end if;

  if new_total >= 100 and not exists (select 1 from public.user_badges where user_id = p_user_id and badge_key = 'contributor') then
    insert into public.user_badges (user_id, badge_key) values (p_user_id, 'contributor');
  end if;

  -- Action-specific badges
  if p_action_type = 'note_upload' and not exists (select 1 from public.user_badges where user_id = p_user_id and badge_key = 'note_master') then
    insert into public.user_badges (user_id, badge_key) values (p_user_id, 'note_master');
  end if;

  if p_action_type = 'event_create' and not exists (select 1 from public.user_badges where user_id = p_user_id and badge_key = 'event_organizer') then
    insert into public.user_badges (user_id, badge_key) values (p_user_id, 'event_organizer');
  end if;

  if p_action_type = 'mentorship' and not exists (select 1 from public.user_badges where user_id = p_user_id and badge_key = 'mentor') then
    insert into public.user_badges (user_id, badge_key) values (p_user_id, 'mentor');
  end if;
end;
$$ language plpgsql security definer;

-- Grant execute permission
grant execute on function add_user_points(uuid, integer, text) to authenticated;

