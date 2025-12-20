-- Alumni Mentorship system
create table if not exists public.mentorship_requests (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mentorship_requests_alumni_id_idx on public.mentorship_requests (alumni_id, status);
create index if not exists mentorship_requests_student_id_idx on public.mentorship_requests (student_id, status);

alter table public.mentorship_requests enable row level security;

create policy "Users can view their own mentorship requests"
  on public.mentorship_requests
  for select
  using (auth.uid() = alumni_id or auth.uid() = student_id);

create policy "Students can create mentorship requests"
  on public.mentorship_requests
  for insert
  with check (auth.uid() = student_id);

create policy "Alumni can update requests they received"
  on public.mentorship_requests
  for update
  using (auth.uid() = alumni_id)
  with check (auth.uid() = alumni_id);

create policy "Students can update their own requests"
  on public.mentorship_requests
  for update
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

