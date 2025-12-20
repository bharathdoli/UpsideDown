-- Event RSVP system
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  unique(event_id, user_id)
);

create index if not exists event_rsvps_event_id_idx on public.event_rsvps (event_id);
create index if not exists event_rsvps_user_id_idx on public.event_rsvps (user_id);

alter table public.event_rsvps enable row level security;

create policy "Users can view all RSVPs"
  on public.event_rsvps
  for select
  using (true);

create policy "Users can manage their own RSVPs"
  on public.event_rsvps
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

