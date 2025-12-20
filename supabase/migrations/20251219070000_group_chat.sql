-- Group chat messages for study groups
create table if not exists public.group_chat_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text,
  file_url text, -- For file attachments
  file_name text, -- Original file name
  created_at timestamptz not null default now()
);

create index if not exists group_chat_messages_group_id_idx on public.group_chat_messages (group_id, created_at desc);

alter table public.group_chat_messages enable row level security;

create policy "Group members can view messages"
  on public.group_chat_messages
  for select
  using (
    exists (
      select 1 from public.study_group_members
      where study_group_members.group_id = group_chat_messages.group_id
      and study_group_members.user_id = auth.uid()
    )
  );

create policy "Group members can send messages"
  on public.group_chat_messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.study_group_members
      where study_group_members.group_id = group_chat_messages.group_id
      and study_group_members.user_id = auth.uid()
    )
  );

create policy "Group members can delete their own messages"
  on public.group_chat_messages
  for delete
  using (
    auth.uid() = sender_id
    and exists (
      select 1 from public.study_group_members
      where study_group_members.group_id = group_chat_messages.group_id
      and study_group_members.user_id = auth.uid()
    )
  );

