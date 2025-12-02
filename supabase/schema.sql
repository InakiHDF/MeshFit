-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Categories are public read-only for now (or shared)
-- But for this app, let's make them public read, admin write.
-- Since we don't have an admin role setup, we'll just let anyone read.
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

-- Items Table Updates
ALTER TABLE items ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid();

CREATE POLICY "Users can view their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Connections Table Updates
ALTER TABLE connections ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid();

CREATE POLICY "Users can view their own connections" ON connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections" ON connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections" ON connections
  FOR DELETE USING (auth.uid() = user_id);

-- Storage Bucket for Item Images
-- Note: You need to create a bucket named 'item-images' in Supabase Storage manually or via API.
-- Policy for Storage
-- CREATE POLICY "Give users access to own folder 1ro140_0" ON storage.objects
--   FOR SELECT TO public USING (bucket_id = 'item-images' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Give users access to own folder 1ro140_1" ON storage.objects
--   FOR INSERT TO public WITH CHECK (bucket_id = 'item-images' AND (storage.foldername(name))[1] = auth.uid()::text);
