-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('notes', 'notes', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('events', 'events', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('issues', 'issues', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('marketplace', 'marketplace', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for notes bucket
CREATE POLICY "Anyone can view notes files" ON storage.objects FOR SELECT USING (bucket_id = 'notes');
CREATE POLICY "Authenticated users can upload notes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own notes files" ON storage.objects FOR DELETE USING (bucket_id = 'notes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for events bucket
CREATE POLICY "Anyone can view event images" ON storage.objects FOR SELECT USING (bucket_id = 'events');
CREATE POLICY "Authenticated users can upload event images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'events' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own event images" ON storage.objects FOR DELETE USING (bucket_id = 'events' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for issues bucket
CREATE POLICY "Anyone can view issue images" ON storage.objects FOR SELECT USING (bucket_id = 'issues');
CREATE POLICY "Authenticated users can upload issue images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'issues' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own issue images" ON storage.objects FOR DELETE USING (bucket_id = 'issues' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for marketplace bucket
CREATE POLICY "Anyone can view marketplace images" ON storage.objects FOR SELECT USING (bucket_id = 'marketplace');
CREATE POLICY "Authenticated users can upload marketplace images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'marketplace' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own marketplace images" ON storage.objects FOR DELETE USING (bucket_id = 'marketplace' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for avatars bucket
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);