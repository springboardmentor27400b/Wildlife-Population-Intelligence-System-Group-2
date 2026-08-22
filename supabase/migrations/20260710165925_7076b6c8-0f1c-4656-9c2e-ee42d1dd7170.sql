
CREATE POLICY "wildlife images read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('wildlife-images','wildlife-audio'));
CREATE POLICY "wildlife images write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('wildlife-images','wildlife-audio') AND owner = auth.uid());
CREATE POLICY "wildlife images update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('wildlife-images','wildlife-audio') AND owner = auth.uid());
CREATE POLICY "wildlife images delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('wildlife-images','wildlife-audio') AND owner = auth.uid());
