-- Create Categories Table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('top', 'bottom', 'footwear', 'accessory', 'outerwear')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Items Table
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  attributes JSONB DEFAULT '{}'::jsonb, -- Stores color, material, fit, formality, warmth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Connections Table (Undirected Graph Edges)
-- We enforce item_id_a < item_id_b to avoid duplicate edges (A-B and B-A)
CREATE TABLE connections (
  item_id_a UUID REFERENCES items(id) ON DELETE CASCADE,
  item_id_b UUID REFERENCES items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (item_id_a, item_id_b),
  CONSTRAINT check_order CHECK (item_id_a < item_id_b)
);

-- Indexes for performance
CREATE INDEX idx_items_category ON items(category_id);
CREATE INDEX idx_connections_a ON connections(item_id_a);
CREATE INDEX idx_connections_b ON connections(item_id_b);

-- Seed Categories
INSERT INTO categories (name, type) VALUES
('T-Shirt', 'top'),
('Shirt', 'top'),
('Sweater', 'top'),
('Jeans', 'bottom'),
('Trousers', 'bottom'),
('Shorts', 'bottom'),
('Sneakers', 'footwear'),
('Boots', 'footwear'),
('Jacket', 'outerwear'),
('Coat', 'outerwear'),
('Hat', 'accessory');
