-- Saved / bookmarked items across different content types
create table if not exists public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('note', 'event', 'listing', 'study_buddy', 'alumni', 'lost_found', 'tutorial')),
  item_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_items_user_id_idx on public.saved_items (user_id);
create index if not exists saved_items_item_type_item_id_idx on public.saved_items (item_type, item_id);

-- Ensure a user can only save an item once
create unique index if not exists saved_items_unique_per_user_item
  on public.saved_items (user_id, item_type, item_id);

-- Basic RLS
alter table public.saved_items enable row level security;

create policy "Users can manage their own saved items"
  on public.saved_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- In-app notifications (no email)
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, -- e.g. 'note_new', 'event_rsvp', 'issue_resolved'
  title text not null,
  body text,
  link text, -- optional URL or route in the app
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, is_read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications
  for select
  using (auth.uid() = user_id);

-- Allow users to insert notifications (for themselves or others via service role)
-- In practice, notifications will be created by the app, so we allow authenticated inserts
create policy "Users can insert notifications"
  on public.notifications
  for insert
  with check (auth.uid() is not null);

create policy "Users can update their own notifications"
  on public.notifications
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


