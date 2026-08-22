
CREATE POLICY "Public read species images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'wildlife-images' AND (storage.foldername(name))[1] = 'species');

CREATE POLICY "Authenticated upload species images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'wildlife-images' AND (storage.foldername(name))[1] = 'species');

CREATE POLICY "Authenticated update species images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'wildlife-images' AND (storage.foldername(name))[1] = 'species');

CREATE POLICY "Authenticated delete species images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'wildlife-images' AND (storage.foldername(name))[1] = 'species');
