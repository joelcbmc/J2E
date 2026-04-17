-- Create comments table for shared comments across all users
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  author TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read comments
CREATE POLICY "Allow public read access" ON comments
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert comments
CREATE POLICY "Allow public insert access" ON comments
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow comment authors to delete their own comments
CREATE POLICY "Allow users to delete own comments" ON comments
  FOR DELETE
  USING (auth.uid()::text = author OR author ILIKE '%anonym%');
