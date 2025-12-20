-- Create storage bucket for lost and found images
insert into storage.buckets (id, name, public)
values ('lost-found', 'lost-found', true)
on conflict (id) do nothing;

-- Storage policies for lost and found images
create policy "Users can upload lost/found images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'lost-found'
    and auth.uid() is not null
  );

create policy "Anyone can view lost/found images"
  on storage.objects
  for select
  using (bucket_id = 'lost-found');

create policy "Users can delete their own images"
  on storage.objects
  for delete
  using (
    bucket_id = 'lost-found'
    and (storage.objects.owner_id)::text = auth.uid()::text
  );

