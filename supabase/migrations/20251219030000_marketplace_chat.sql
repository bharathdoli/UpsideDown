-- Marketplace chat system
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(buyer_id, seller_id, listing_id)
);

create index if not exists chats_buyer_id_idx on public.chats (buyer_id);
create index if not exists chats_seller_id_idx on public.chats (seller_id);
create index if not exists chats_listing_id_idx on public.chats (listing_id);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_chat_id_idx on public.chat_messages (chat_id, created_at desc);

alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users can view chats they're part of"
  on public.chats
  for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can create chats"
  on public.chats
  for insert
  with check (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Users can view messages in their chats"
  on public.chat_messages
  for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = chat_messages.chat_id
      and (chats.buyer_id = auth.uid() or chats.seller_id = auth.uid())
    )
  );

create policy "Users can send messages in their chats"
  on public.chat_messages
  for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.chats
      where chats.id = chat_messages.chat_id
      and (chats.buyer_id = auth.uid() or chats.seller_id = auth.uid())
    )
  );

-- Trigger to update chat updated_at
create or replace function update_chat_updated_at()
returns trigger as $$
begin
  update public.chats set updated_at = now() where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

create trigger chat_messages_updated_at
  after insert on public.chat_messages
  for each row
  execute function update_chat_updated_at();

