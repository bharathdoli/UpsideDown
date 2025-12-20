-- Create storage bucket for group chat files
insert into storage.buckets (id, name, public)
values ('group-files', 'group-files', true)
on conflict (id) do nothing;

-- Storage policies for group files
create policy "Group members can upload files"
  on storage.objects
  for insert
  with check (
    bucket_id = 'group-files'
    and exists (
      select 1 from public.study_group_members
      join public.study_groups on study_groups.id = study_group_members.group_id
      where study_group_members.user_id = auth.uid()
      and (storage.objects.name)::text like study_groups.id::text || '/%'
    )
  );

create policy "Group members can view files"
  on storage.objects
  for select
  using (
    bucket_id = 'group-files'
    and exists (
      select 1 from public.study_group_members
      join public.study_groups on study_groups.id = study_group_members.group_id
      where study_group_members.user_id = auth.uid()
      and (storage.objects.name)::text like study_groups.id::text || '/%'
    )
  );

create policy "Group members can delete their own files"
  on storage.objects
  for delete
  using (
    bucket_id = 'group-files'
    and (storage.objects.owner_id)::text = auth.uid()::text
  );

